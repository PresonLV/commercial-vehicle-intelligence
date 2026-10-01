/**
 * Figures copied out of a stored report. A row is kept only when the period, segment, metric,
 * number and unit are all written in the text. A year-on-year percentage is not a level.
 * Cumulative ranges (1-8月, 前8月) are not a single month, so they are left out.
 */
const SEGMENTS = [
  "新能源商用车", "新能源汽车", "中重型货车", "重型货车", "轻型货车", "轻型客车", "中型客车", "大型客车",
  "重卡", "中卡", "轻卡", "微卡", "发动机", "客车", "商用车", "工程机械", "农机", "船用", "发电",
];
const SEGMENT_RE = SEGMENTS.join("|");
const METRIC_WORD = "产量|批发销量|批发|销量|上牌量|上牌|交强险";
const UNIT_RE = "万辆|万台|辆|台";
const METRIC_OF: Record<string, string> = {
  产量: "production",
  批发销量: "wholesale",
  批发: "wholesale",
  销量: "sales",
  上牌量: "registrations",
  上牌: "registrations",
  交强险: "insurance",
};
const NOT_BRAND = new Set(["国内", "其中", "本月", "产品", "公司", "商用", "汽车", "合计", "注"]);

export interface MetricPoint {
  metric: string;
  segment: string;
  period: string;
  value: number;
  unit: string;
}

export interface MetricFigure extends MetricPoint {
  brand: string;
  method: "sentence" | "table" | "llm";
}

export const METRIC_LABELS: Record<string, string> = {
  production: "产量",
  wholesale: "批发",
  sales: "销量",
  registrations: "上牌量",
  insurance: "交强险",
};

const UNITS = new Set(["万辆", "万台", "辆", "台"]);

function periodOf(year: string, month: string): string | null {
  const m = Number(month);
  if (m < 1 || m > 12) return null;
  return `${year}-${String(m).padStart(2, "0")}`;
}

function segmentIn(text: string): string | null {
  for (const segment of SEGMENTS) if (text.includes(segment)) return segment;
  return null;
}

function metricOf(word: string): string | null {
  return METRIC_OF[word] ?? null;
}

function pushFigure(out: MetricFigure[], seen: Set<string>, row: MetricFigure) {
  if (!Number.isFinite(row.value) || row.value < 0) return;
  if (!UNITS.has(row.unit) || !METRIC_LABELS[row.metric]) return;
  const key = `${row.metric}|${row.segment}|${row.brand}|${row.period}|${row.unit}`;
  if (seen.has(key)) return;
  seen.add(key);
  out.push(row);
}

/** A filing laid out as 本月 / 去年同期 / 累计, then the same block again for 产量. */
function layoutRows(text: string): MetricFigure[] {
  const compact = text.replace(/([产销])\s+(?=量)/g, "$1");
  if (!/本月/.test(compact) || !/去年同期/.test(compact) || !/产量/.test(compact) || !/销量/.test(compact)) return [];
  const head = text.slice(0, 500);
  const ym = /(20\d{2})\s*年\s*(\d{1,2})\s*月/.exec(head) ?? /(20\d{2})\s*年\s*(\d{1,2})\s*月/.exec(text);
  const period = ym ? periodOf(ym[1]!, ym[2]!) : null;
  if (!period) return [];
  const unit = /销\s*量\s*[（(]\s*(万辆|万台|辆|台)\s*[）)]/.exec(text)?.[1] ?? "辆";
  const out: MetricFigure[] = [];
  for (const line of text.split(/\n/)) {
    if (/乘用车|合计|证券代码|董事会/.test(line)) continue;
    const segment = segmentIn(line);
    if (!segment) continue;
    const tokens = line.split(/\s+/);
    const integers: number[] = [];
    let percentAt = -1;
    for (const token of tokens) {
      if (/\d+(?:\.\d+)?%/.test(token)) {
        if (percentAt < 0) percentAt = integers.length;
        continue;
      }
      const digits = token.replace(/,/g, "");
      if (/^\d{2,}$/.test(digits)) integers.push(Number(digits));
    }
    if (integers.length < 6 || percentAt <= 0 || percentAt >= integers.length) continue;
    const sales = integers[0]!;
    const production = integers[percentAt]!;
    if (!line.includes(String(sales)) || !line.includes(String(production))) continue;
    out.push({ metric: "sales", segment, brand: "", period, value: sales, unit, method: "table" });
    out.push({ metric: "production", segment, brand: "", period, value: production, unit, method: "table" });
  }
  return out;
}

function htmlTables(html: string): string[][] {
  const tables: string[][] = [];
  for (const table of html.matchAll(/<table\b[\s\S]*?<\/table>/gi)) {
    const rows: string[] = [];
    for (const row of table[0].matchAll(/<tr\b[\s\S]*?<\/tr>/gi)) {
      const cells = [...row[0].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
        .map((cell) => cell[1]!.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
      if (cells.length) rows.push(cells.join("\t"));
    }
    tables.push(rows);
  }
  return tables;
}

function htmlTableRows(html: string): MetricFigure[] {
  if (!html || !/<table\b/i.test(html)) return [];
  const out: MetricFigure[] = [];
  for (const rows of htmlTables(html)) {
    if (rows.length < 2) continue;
    const header = rows[0]!.split("\t");
    const captionPeriod = periodFromText(header.join(" "));
    for (let col = 1; col < header.length; col++) {
      const label = header[col] ?? "";
      if (/同比|环比|累计|%/.test(label)) continue;
      const word = METRIC_WORD.split("|").find((item) => label.includes(item));
      const unit = UNIT_RE.split("|").find((item) => label.includes(item));
      const metric = word ? metricOf(word) : null;
      const period = periodFromText(label) ?? captionPeriod;
      if (!metric || !unit || !period) continue;
      for (const raw of rows.slice(1)) {
        const cells = raw.split("\t");
        const name = cells[0] ?? "";
        if (!name || /合计|乘用车/.test(name)) continue;
        const segment = segmentIn(name);
        if (!segment) continue;
        const brand = name.replace(segment, "").replace(/[（）()\s含]/g, "");
        const value = Number((cells[col] ?? "").replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0]);
        if (!Number.isFinite(value)) continue;
        if (!(cells[col] ?? "").includes(String(value))) continue;
        out.push({
          metric, segment, period, value, unit, method: "table",
          brand: brand && !NOT_BRAND.has(brand) && brand.length <= 8 ? brand : "",
        });
      }
    }
  }
  return out;
}

function periodFromText(text: string): string | null {
  const ym = /(20\d{2})\s*年\s*(\d{1,2})\s*月/.exec(text);
  return ym ? periodOf(ym[1]!, ym[2]!) : null;
}

function sentenceRows(text: string): MetricFigure[] {
  const out: MetricFigure[] = [];
  const explicit = new RegExp(
    `([\\u4e00-\\u9fa5]{2,4})?(${SEGMENT_RE})\\s*(20\\d{2})\\s*年\\s*(\\d{1,2})\\s*月\\s*(${METRIC_WORD})\\s*(\\d+(?:\\.\\d+)?)\\s*(${UNIT_RE})`,
    "g",
  );
  for (const match of text.matchAll(explicit)) {
    const period = periodOf(match[3]!, match[4]!);
    const metric = metricOf(match[5]!);
    const brand = match[1] && !NOT_BRAND.has(match[1]) ? match[1] : "";
    if (!period || !metric) continue;
    out.push({ metric, segment: match[2]!, brand, period, value: Number(match[6]), unit: match[7]!, method: "sentence" });
  }

  let carried: { year: string; month: string } | null = null;
  let carriedSegment = "";
  const figure = new RegExp(
    `(${SEGMENT_RE})[^，,。\\n\\d]{0,16}?(${METRIC_WORD})[^，,。\\n\\d]{0,8}(\\d+(?:\\.\\d+)?)\\s*(${UNIT_RE})`,
    "g",
  );
  const monthLevel = new RegExp(`(${SEGMENT_RE})[^，,。\\n\\d]{0,8}单月\\s*(\\d+(?:\\.\\d+)?)\\s*(${UNIT_RE})`, "g");
  const brandOne = new RegExp(`([\\u4e00-\\u9fa5]{2,8})以(\\d+(?:\\.\\d+)?)\\s*(${UNIT_RE})(?:的)?(${METRIC_WORD})?`, "g");
  const brandTwo = new RegExp(
    `([\\u4e00-\\u9fa5]{2,8})和([\\u4e00-\\u9fa5]{2,8})分别以(\\d+(?:\\.\\d+)?)\\s*(${UNIT_RE})和(\\d+(?:\\.\\d+)?)\\s*(${UNIT_RE})`,
    "g",
  );
  for (const part of text.split(/(?<=[。\n])/)) {
    const dated = [...part.matchAll(/(20\d{2})\s*年\s*(\d{1,2})\s*月/g)];
    if (dated.length) carried = { year: dated.at(-1)![1]!, month: dated.at(-1)![2]! };
    const cumulative = /前\s*\d+\s*月|1\s*[-~至到]\s*\d+\s*月|累计/.test(part);
    const found = segmentIn(part);
    if (found && !cumulative) carriedSegment = found;
    if (cumulative || !carried) continue;
    const monthOnly = /(?<!\d)(\d{1,2})\s*月/.exec(part);
    if (monthOnly && Number(monthOnly[1]) !== Number(carried.month)) continue;
    const period = periodOf(carried.year, carried.month);
    if (!period) continue;
    for (const match of part.matchAll(monthLevel)) {
      out.push({ metric: "sales", segment: match[1]!, brand: "", period, value: Number(match[2]), unit: match[3]!, method: "sentence" });
    }
    for (const match of part.matchAll(figure)) {
      const metric = metricOf(match[2]!);
      if (!metric) continue;
      out.push({ metric, segment: match[1]!, brand: "", period, value: Number(match[3]), unit: match[4]!, method: "sentence" });
    }
    if (!carriedSegment || !/(销量|产量|上牌|交强险|批发)/.test(part)) continue;
    const metric = metricOf(METRIC_WORD.split("|").find((word) => part.includes(word)) ?? "");
    if (!metric) continue;
    for (const match of part.matchAll(brandOne)) {
      if (SEGMENTS.includes(match[1]!) || NOT_BRAND.has(match[1]!) || /和|分别/.test(match[1]!)) continue;
      out.push({ metric, segment: carriedSegment, brand: match[1]!, period, value: Number(match[2]), unit: match[3]!, method: "sentence" });
    }
    for (const match of part.matchAll(brandTwo)) {
      out.push({ metric, segment: carriedSegment, brand: match[1]!, period, value: Number(match[3]), unit: match[4]!, method: "sentence" });
      out.push({ metric, segment: carriedSegment, brand: match[2]!, period, value: Number(match[5]), unit: match[6]!, method: "sentence" });
    }
  }
  return out;
}

/** Sentences, filing layouts and HTML tables. The number is taken from the source text, not computed. */
export function extractFigures(text: string, html = ""): MetricFigure[] {
  const out: MetricFigure[] = [];
  const seen = new Set<string>();
  for (const row of [...layoutRows(text), ...htmlTableRows(html), ...sentenceRows(text)]) pushFigure(out, seen, row);
  return out;
}

/** Segment totals written as “某年某月某细分销量 N 万辆”, the shape the first data page tested. */
export function extractMetricPoints(text: string): MetricPoint[] {
  return extractFigures(text)
    .filter((row) => row.brand === "" && row.method === "sentence")
    .map(({ metric, segment, period, value, unit }) => ({ metric, segment, period, value, unit }));
}

export interface ProposedMetric {
  metric: string;
  segment: string;
  brand?: string;
  period: string;
  value: number;
  unit: string;
}

/**
 * A model suggestion is kept only when that exact number sits next to a unit in the source,
 * and the segment (and brand, if any) are written there too. Anything else is dropped.
 */
export function acceptLiteralMetrics(source: string, rows: ProposedMetric[]): MetricFigure[] {
  const out: MetricFigure[] = [];
  const seen = new Set<string>();
  const flat = source.replace(/\s+/g, "");
  for (const row of rows) {
    const brand = (row.brand ?? "").trim();
    const value = String(row.value);
    const unit = row.unit;
    const label = METRIC_LABELS[row.metric];
    if (!label || !/^\d{4}-\d{2}$/.test(row.period) || !UNITS.has(unit)) continue;
    if (!flat.includes(row.segment) || (brand && !flat.includes(brand))) continue;
    const escaped = value.replace(/[.]/g, "\\.");
    const at = new RegExp(`${escaped}\\s*(?:${unit})`).exec(source);
    if (!at || at.index === undefined) continue;
    const around = source.slice(Math.max(0, at.index - 32), at.index + at[0].length);
    if (!around.includes(row.segment) || !around.includes(label === "上牌量" ? "上牌" : label)) continue;
    pushFigure(out, seen, {
      metric: row.metric, segment: row.segment, brand, period: row.period, value: row.value, unit, method: "llm",
    });
  }
  return out;
}

const CSV_HEADER = ["metric", "segment", "brand", "period", "value", "unit", "source_name", "url"];
const CSV_HEADER_GRAIN = ["metric", "segment", "brand", "period", "grain", "value", "unit", "source_name", "url"];
const GRAINS = new Set(["month", "year", "ytd"]);

export interface ManualMetricRow {
  metric: string;
  segment: string;
  brand: string;
  period: string;
  grain: "month" | "year" | "ytd";
  value: number;
  unit: string;
  sourceName: string;
  url: string;
}

function periodOk(grain: string, period: string): boolean {
  if (grain === "year") return /^\d{4}$/.test(period);
  return /^\d{4}-\d{2}$/.test(period) && Number(period.slice(5)) >= 1 && Number(period.slice(5)) <= 12;
}

/** Admin CSV. The header is required. Grain defaults to a single month when that column is omitted. */
export function parseMetricCsv(csv: string): { rows: ManualMetricRow[]; errors: string[] } {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const errors: string[] = [];
  if (!lines.length) return { rows: [], errors: ["CSV 是空的"] };
  const header = lines[0]!.split(",").map((cell) => cell.trim());
  const withGrain = header.join(",") === CSV_HEADER_GRAIN.join(",");
  if (!withGrain && header.join(",") !== CSV_HEADER.join(",")) {
    return { rows: [], errors: [`表头必须是 ${CSV_HEADER.join(",")} 或 ${CSV_HEADER_GRAIN.join(",")}`] };
  }
  const rows: ManualMetricRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsv(lines[i]!);
    if (cells.length !== header.length) {
      errors.push(`第 ${i + 1} 行列数不对`);
      continue;
    }
    const trimmed = cells.map((cell) => cell.trim());
    const metric = trimmed[0];
    const segment = trimmed[1];
    const brand = trimmed[2] ?? "";
    const period = trimmed[3] ?? "";
    const grain = withGrain ? trimmed[4] ?? "" : "month";
    const rawValue = withGrain ? trimmed[5] : trimmed[4];
    const unit = withGrain ? trimmed[6] : trimmed[5];
    const sourceName = withGrain ? trimmed[7] : trimmed[6];
    const url = withGrain ? trimmed[8] : trimmed[7];
    const value = Number(rawValue);
    if (!metric || !METRIC_LABELS[metric]) errors.push(`第 ${i + 1} 行指标必须是 ${Object.keys(METRIC_LABELS).join("、")}`);
    else if (!segment) errors.push(`第 ${i + 1} 行缺少细分`);
    else if (!GRAINS.has(grain)) errors.push(`第 ${i + 1} 行粒度必须是 month、year 或 ytd`);
    else if (!periodOk(grain, period)) errors.push(`第 ${i + 1} 行期间与粒度不符`);
    else if (!Number.isFinite(value) || value < 0) errors.push(`第 ${i + 1} 行数值无效`);
    else if (!UNITS.has(unit ?? "")) errors.push(`第 ${i + 1} 行单位必须是万辆、万台、辆或台`);
    else if (!sourceName) errors.push(`第 ${i + 1} 行缺少来源名称`);
    else if (!/^https?:\/\//.test(url ?? "")) errors.push(`第 ${i + 1} 行需要原文链接`);
    else rows.push({ metric, segment, brand, period, grain: grain as ManualMetricRow["grain"], value, unit: unit!, sourceName, url: url! });
  }
  return { rows, errors };
}

function splitCsv(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (quoted && ch === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
    } else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      cells.push(cur);
      cur = "";
    } else cur += ch;
  }
  cells.push(cur);
  return cells;
}
