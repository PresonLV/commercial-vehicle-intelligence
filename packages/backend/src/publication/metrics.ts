// Public read of stored figures. Sample rows are labeled; nothing here invents a number.
import { sql } from "../db.ts";

export interface MetricRow {
  metric: string;
  segment: string;
  brand: string;
  period: string;
  grain: "month" | "year" | "ytd";
  value: number;
  unit: string;
  sourceName: string;
  url: string;
  sample: boolean;
  method: string;
}

export async function loadMetricPoints(): Promise<MetricRow[]> {
  const rows = await sql<{
    metric: string; segment: string; brand: string; period: string; grain: "month" | "year" | "ytd"; value: string; unit: string; source_name: string; url: string; sample: boolean; method: string;
  }[]>`
    SELECT metric, segment, brand, period, grain, value::text, unit, source_name, url, sample, method
    FROM metric_points
    WHERE confidence = 'high'
    ORDER BY metric, segment, brand, grain, period`;
  return rows.map((row) => ({
    metric: row.metric,
    segment: row.segment,
    brand: row.brand,
    period: row.period,
    grain: row.grain,
    value: Number(row.value),
    unit: row.unit,
    sourceName: row.source_name,
    url: row.url,
    sample: row.sample,
    method: row.method,
  }));
}
