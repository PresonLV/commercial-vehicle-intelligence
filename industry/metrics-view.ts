// How the data page reads stored figures. Cumulative totals are either cited or a sum of
// January-through-k when those months are all present. A stated growth rate is not a level.
import { normalizeUnit } from "./metric-units.ts";

export type Grain = "month" | "year" | "ytd";

export interface MetricViewPoint {
  metric: string;
  segment: string;
  brand: string;
  brandText?: string;
  period: string;
  grain: Grain;
  value: number;
  unit: string;
  sourceName: string;
  url: string;
  page?: string;
  sample: boolean;
}

export function visiblePoints<T extends { metric: string; sample: boolean }>(points: T[]): T[] {
  const live = new Set(points.filter((point) => !point.sample).map((point) => point.metric));
  return points.filter((point) => !point.sample || !live.has(point.metric));
}

export function periodLabel(period: string, grain: Grain): string {
  if (grain === "year") return `${period}年`;
  const [year, month] = period.split("-");
  const n = Number(month);
  if (grain === "ytd") return `${year}年1–${n}月`;
  return `${year}年${n}月`;
}

export function formatChange(ratio: number | null): string {
  if (ratio === null || !Number.isFinite(ratio)) return "—";
  const pct = ratio * 100;
  return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

function monthNumber(period: string): number | null {
  if (!/^\d{4}-\d{2}$/.test(period)) return null;
  const month = Number(period.slice(5));
  return month >= 1 && month <= 12 ? month : null;
}

function matches(point: MetricViewPoint, query: { metric: string; segment: string; brand: string; unit?: string }): boolean {
  return point.metric === query.metric && point.segment === query.segment && point.brand === query.brand && (!query.unit || point.unit === query.unit);
}

export interface YtdReading {
  year: string;
  endMonth: number | null;
  value: number | null;
  unit: string;
  sourceName: string;
  url: string;
  basis: "cited" | "sum" | "none";
  missingMonths: number[];
  openMonths: number[];
}

function monthsAfter(end: number): number[] {
  const out: number[] = [];
  for (let month = end + 1; month <= 12; month++) out.push(month);
  return out;
}

/**
 * Cited 1–k月 wins when it reaches at least as far as the contiguous January prefix.
 * A later complete prefix replaces it, so a newly stored month extends the year.
 * August alone is not 1–8月. September alone does not replace a cited 1–8月.
 */
export function readYtd(points: MetricViewPoint[], query: { metric: string; segment: string; brand: string; year: string; unit: string }): YtdReading {
  const rows = points.filter((point) => matches(point, query) && point.period.startsWith(`${query.year}-`));
  const months = new Map<number, MetricViewPoint>();
  for (const row of rows) {
    if (row.grain !== "month") continue;
    const month = monthNumber(row.period);
    if (month) months.set(month, row);
  }
  let prefix = 0;
  for (let month = 1; month <= 12; month++) {
    if (!months.has(month)) break;
    prefix = month;
  }
  const cited = rows
    .filter((point) => point.grain === "ytd" && monthNumber(point.period))
    .sort((a, b) => b.period.localeCompare(a.period))[0];
  const citedEnd = cited ? monthNumber(cited.period)! : 0;
  if (cited && citedEnd >= prefix && citedEnd > 0) {
    const missingMonths: number[] = [];
    for (let month = 1; month <= citedEnd; month++) if (!months.has(month)) missingMonths.push(month);
    return {
      year: query.year, endMonth: citedEnd, value: cited.value, unit: cited.unit,
      sourceName: cited.sourceName, url: cited.url, basis: "cited", missingMonths, openMonths: monthsAfter(citedEnd),
    };
  }
  if (prefix > 0) {
    let sum = 0;
    for (let month = 1; month <= prefix; month++) sum += months.get(month)!.value;
    const first = months.get(1)!;
    return {
      year: query.year, endMonth: prefix, value: sum, unit: query.unit,
      sourceName: first.sourceName, url: first.url, basis: "sum", missingMonths: [], openMonths: monthsAfter(prefix),
    };
  }
  return {
    year: query.year, endMonth: null, value: null, unit: query.unit,
    sourceName: "", url: "", basis: "none", missingMonths: [], openMonths: monthsAfter(0),
  };
}

/** A cited total for this exact end month, otherwise the sum of January through that month. */
export function readYtdAt(points: MetricViewPoint[], query: { metric: string; segment: string; brand: string; year: string; unit: string }, endMonth: number): YtdReading {
  const rows = points.filter((point) => matches(point, query) && point.period.startsWith(`${query.year}-`));
  const cited = rows.find((point) => point.grain === "ytd" && monthNumber(point.period) === endMonth);
  if (cited) {
    return {
      year: query.year, endMonth, value: cited.value, unit: cited.unit,
      sourceName: cited.sourceName, url: cited.url, basis: "cited", missingMonths: [], openMonths: monthsAfter(endMonth),
    };
  }
  const months = new Map<number, MetricViewPoint>();
  for (const row of rows) {
    if (row.grain !== "month") continue;
    const month = monthNumber(row.period);
    if (month) months.set(month, row);
  }
  for (let month = 1; month <= endMonth; month++) {
    if (!months.has(month)) {
      return {
        year: query.year, endMonth: null, value: null, unit: query.unit,
        sourceName: "", url: "", basis: "none", missingMonths: [], openMonths: monthsAfter(0),
      };
    }
  }
  let sum = 0;
  for (let month = 1; month <= endMonth; month++) sum += months.get(month)!.value;
  const first = months.get(1)!;
  return {
    year: query.year, endMonth, value: sum, unit: query.unit,
    sourceName: first.sourceName, url: first.url, basis: "sum", missingMonths: [], openMonths: monthsAfter(endMonth),
  };
}

/** Same end month and the same unit. A percent in a source is not used. */
export function ytdChange(current: YtdReading, prior: YtdReading): number | null {
  if (current.basis === "none" || prior.basis === "none") return null;
  if (current.endMonth === null || current.endMonth !== prior.endMonth) return null;
  if (current.unit !== prior.unit || current.value === null || prior.value === null || prior.value === 0) return null;
  return (current.value - prior.value) / prior.value;
}

export function annualSeries(points: MetricViewPoint[], query: { metric: string; segment: string; brand: string; unit?: string }): MetricViewPoint[] {
  const rows = points.filter((point) => point.grain === "year" && matches(point, query));
  const byYear = new Map<string, MetricViewPoint>();
  for (const row of rows.sort((a, b) => a.period.localeCompare(b.period) || a.url.localeCompare(b.url))) {
    if (!byYear.has(row.period)) byYear.set(row.period, row);
  }
  return [...byYear.values()];
}

export function yearChange(points: MetricViewPoint[]): Map<string, number | null> {
  const out = new Map<string, number | null>();
  for (let i = 0; i < points.length; i++) {
    const prev = i > 0 && Number(points[i]!.period) === Number(points[i - 1]!.period) + 1 ? points[i - 1] : undefined;
    out.set(points[i]!.period, prev && prev.unit === points[i]!.unit && prev.value !== 0 ? (points[i]!.value - prev.value) / prev.value : null);
  }
  return out;
}

export interface RankRow {
  brand: string;
  brandText: string;
  value: number;
  unit: string;
  /** Published figure ×10000 when the unit is 万辆 or 万台. Equal to value when already in 辆 or 台. */
  normValue: number;
  normUnit: string;
  sourceName: string;
  url: string;
  /** Share of the brands in this list. Not a share of a differently worded industry total. */
  listShare: number;
  /** Share of an industry total only when that total uses the same unit. */
  totalShare: number | null;
}

export function brandRank(points: MetricViewPoint[], query: { metric: string; segment: string; period: string; grain: Grain; unit: string }): { rows: RankRow[]; total: MetricViewPoint | null } {
  const rows = points
    .filter((point) => point.brand && point.metric === query.metric && point.segment === query.segment && point.period === query.period && point.grain === query.grain && point.unit === query.unit)
    .sort((a, b) => b.value - a.value || a.brand.localeCompare(a.brand, "zh"));
  const sum = rows.reduce((total, row) => total + row.value, 0);
  const total = points.find((point) => !point.brand && point.metric === query.metric && point.segment === query.segment && point.period === query.period && point.grain === query.grain && point.unit === query.unit) ?? null;
  return {
    total,
    rows: rows.map((row) => {
      const norm = normalizeUnit(row.value, row.unit);
      return {
        brand: row.brand,
        brandText: row.brandText ?? "",
        value: row.value,
        unit: row.unit,
        normValue: norm.value,
        normUnit: norm.unit,
        sourceName: row.sourceName,
        url: row.url,
        listShare: sum > 0 ? row.value / sum : 0,
        totalShare: total && total.value > 0 ? row.value / total.value : null,
      };
    }),
  };
}

/** Rank after 万辆→辆 and 万台→台. Shares use the converted figures. The row still carries the published value. */
export function brandRankNormalized(points: MetricViewPoint[], query: { metric: string; segment: string; period: string; grain: Grain }): { rows: RankRow[]; total: MetricViewPoint | null } {
  const pool = points.filter((point) => point.metric === query.metric && point.segment === query.segment && point.period === query.period && point.grain === query.grain);
  const branded = pool.filter((point) => point.brand).map((point) => ({ point, norm: normalizeUnit(point.value, point.unit) }));
  const normUnit = branded[0]?.norm.unit ?? "";
  const same = branded.filter((row) => row.norm.unit === normUnit).sort((a, b) => b.norm.value - a.norm.value || a.point.brand.localeCompare(b.point.brand, "zh"));
  const sum = same.reduce((total, row) => total + row.norm.value, 0);
  const totalPoint = pool.find((point) => !point.brand) ?? null;
  const totalNorm = totalPoint ? normalizeUnit(totalPoint.value, totalPoint.unit) : null;
  return {
    total: totalPoint,
    rows: same.map((row) => ({
      brand: row.point.brand,
      brandText: row.point.brandText ?? "",
      value: row.point.value,
      unit: row.point.unit,
      normValue: row.norm.value,
      normUnit: row.norm.unit,
      sourceName: row.point.sourceName,
      url: row.point.url,
      listShare: sum > 0 ? row.norm.value / sum : 0,
      totalShare: totalNorm && totalNorm.unit === row.norm.unit && totalNorm.value > 0 ? row.norm.value / totalNorm.value : null,
    })),
  };
}

export interface CoverageLine {
  metric: string;
  segment: string;
  brand: string;
  grain: Grain;
  unit: string;
  periods: string[];
  sourceName: string;
  url: string;
}

export function coverageLines(points: MetricViewPoint[]): CoverageLine[] {
  const grouped = new Map<string, CoverageLine>();
  for (const point of points) {
    const key = [point.metric, point.segment, point.brand, point.grain, point.unit, point.url].join("|");
    const line = grouped.get(key);
    if (line) line.periods.push(point.period);
    else grouped.set(key, { metric: point.metric, segment: point.segment, brand: point.brand, grain: point.grain, unit: point.unit, periods: [point.period], sourceName: point.sourceName, url: point.url });
  }
  return [...grouped.values()]
    .map((line) => ({ ...line, periods: [...new Set(line.periods)].sort() }))
    .sort((a, b) => a.metric.localeCompare(b.metric) || a.segment.localeCompare(b.segment, "zh") || a.brand.localeCompare(b.brand, "zh") || a.grain.localeCompare(b.grain) || a.periods[0]!.localeCompare(b.periods[0]!));
}
