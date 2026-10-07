// Public truck prices. Sample rows are labeled; review rows stay in admin.
import { sql } from "../db.ts";
import type { QuoteKind } from "@aihot/industry/quote-parse";
import type { QuoteViewPoint } from "@aihot/industry/quote-view";

export async function loadTruckQuotes(): Promise<QuoteViewPoint[]> {
  const rows = await sql<{
    brand: string; series: string; model_name: string; segment: string; drive: string; engine_brand: string;
    horsepower: number | null; gearbox: string; power_type: string; emission: string; kind: QuoteKind;
    price_wan: string; price_date: string | null; observed_on: string; source_name: string; url: string; excerpt: string; sample: boolean;
  }[]>`
    SELECT brand, series, model_name, segment, drive, engine_brand, horsepower, gearbox, power_type, emission,
      kind, price_wan::text, price_date::text, observed_on::text, source_name, url, excerpt, sample
    FROM truck_quotes
    WHERE confidence = 'high'
    ORDER BY brand, series, model_name, observed_on, kind`;
  return rows.map((row) => ({
    brand: row.brand,
    series: row.series,
    modelName: row.model_name,
    segment: row.segment,
    drive: row.drive,
    engineBrand: row.engine_brand,
    horsepower: row.horsepower,
    gearbox: row.gearbox,
    powerType: row.power_type,
    emission: row.emission,
    kind: row.kind,
    priceWan: Number(row.price_wan),
    priceDate: row.price_date,
    observedOn: row.observed_on,
    sourceName: row.source_name,
    url: row.url,
    excerpt: row.excerpt,
    sample: row.sample,
  }));
}
