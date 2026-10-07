// How the price page groups and filters stored observations. It does not invent a price.
import type { QuoteKind } from "./quote-parse.ts";

export interface QuoteViewPoint {
  brand: string;
  series: string;
  modelName: string;
  segment: string;
  drive: string;
  engineBrand: string;
  horsepower: number | null;
  gearbox: string;
  powerType: string;
  emission: string;
  kind: QuoteKind;
  priceWan: number;
  priceDate: string | null;
  observedOn: string;
  sourceName: string;
  url: string;
  excerpt: string;
  sample: boolean;
}

export interface QuoteModel {
  id: string;
  brand: string;
  series: string;
  modelName: string;
  segment: string;
  drive: string;
  engineBrand: string;
  horsepower: number | null;
  gearbox: string;
  powerType: string;
  emission: string;
  url: string;
  sourceName: string;
  sample: boolean;
  msrp: QuoteViewPoint | null;
  dealer: QuoteViewPoint | null;
  history: QuoteViewPoint[];
}

export interface QuoteFilter {
  segment: string;
  brand: string;
  power: string;
  hpMin: number | null;
  hpMax: number | null;
  priceMin: number | null;
  priceMax: number | null;
  sort: "price-asc" | "price-desc" | "brand";
}

export const NEW_ENERGY = new Set(["纯电", "换电", "氢燃料", "LNG"]);

export function quoteId(url: string): string {
  const id = /\/product\/truck\/(\d+)\.html$/.exec(url)?.[1];
  if (id) return id;
  return url.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "quote";
}

/** 【样例】 stays visible only while the page has no real price. */
export function visibleQuotes(points: QuoteViewPoint[]): QuoteViewPoint[] {
  const real = points.some((point) => !point.sample);
  return real ? points.filter((point) => !point.sample) : points;
}

function latest(points: QuoteViewPoint[], kind: QuoteKind): QuoteViewPoint | null {
  const rows = points.filter((point) => point.kind === kind).sort((a, b) => a.observedOn.localeCompare(b.observedOn));
  return rows.at(-1) ?? null;
}

export function groupQuotes(points: QuoteViewPoint[]): QuoteModel[] {
  const byUrl = new Map<string, QuoteViewPoint[]>();
  for (const point of points) {
    const list = byUrl.get(point.url) ?? [];
    list.push(point);
    byUrl.set(point.url, list);
  }
  return [...byUrl.values()].map((history) => {
    const sorted = [...history].sort((a, b) => a.observedOn.localeCompare(b.observedOn) || a.kind.localeCompare(b.kind));
    const current = sorted.at(-1)!;
    return {
      id: quoteId(current.url),
      brand: current.brand,
      series: current.series,
      modelName: current.modelName,
      segment: current.segment,
      drive: current.drive,
      engineBrand: current.engineBrand,
      horsepower: current.horsepower,
      gearbox: current.gearbox,
      powerType: current.powerType,
      emission: current.emission,
      url: current.url,
      sourceName: current.sourceName,
      sample: current.sample,
      msrp: latest(sorted, "msrp"),
      dealer: latest(sorted, "dealer"),
      history: sorted,
    };
  });
}

export function shownPrice(model: QuoteModel): number | null {
  return model.msrp?.priceWan ?? model.dealer?.priceWan ?? null;
}

export function applyQuoteFilter(models: QuoteModel[], filter: QuoteFilter): QuoteModel[] {
  const filtered = models.filter((model) => {
    if (filter.segment === "新能源") {
      if (!NEW_ENERGY.has(model.powerType)) return false;
    } else if (filter.segment && model.segment !== filter.segment) return false;
    if (filter.brand && model.brand !== filter.brand) return false;
    if (filter.power && model.powerType !== filter.power) return false;
    if (filter.hpMin != null && (model.horsepower == null || model.horsepower < filter.hpMin)) return false;
    if (filter.hpMax != null && (model.horsepower == null || model.horsepower > filter.hpMax)) return false;
    const price = shownPrice(model);
    if (filter.priceMin != null && (price == null || price < filter.priceMin)) return false;
    if (filter.priceMax != null && (price == null || price > filter.priceMax)) return false;
    return true;
  });
  const sorted = [...filtered];
  if (filter.sort === "price-asc" || filter.sort === "price-desc") {
    sorted.sort((a, b) => {
      const left = shownPrice(a);
      const right = shownPrice(b);
      if (left == null && right == null) return a.modelName.localeCompare(b.modelName, "zh");
      if (left == null) return 1;
      if (right == null) return -1;
      return filter.sort === "price-asc" ? left - right : right - left;
    });
  } else {
    sorted.sort((a, b) => a.brand.localeCompare(b.brand, "zh") || a.series.localeCompare(b.series, "zh") || a.modelName.localeCompare(b.modelName, "zh"));
  }
  return sorted;
}

export function groupByBrandSeries(models: QuoteModel[]): Array<{ brand: string; series: string; models: QuoteModel[] }> {
  const groups: Array<{ brand: string; series: string; models: QuoteModel[] }> = [];
  for (const model of models) {
    const last = groups.at(-1);
    if (last && last.brand === model.brand && last.series === model.series) last.models.push(model);
    else groups.push({ brand: model.brand, series: model.series, models: [model] });
  }
  return groups;
}
