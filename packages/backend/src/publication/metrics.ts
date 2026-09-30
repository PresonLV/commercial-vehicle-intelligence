// Public read of stored figures. Sample rows are labeled; nothing here invents a number.
import { sql } from "../db.ts";

export interface MetricRow {
  metric: string;
  segment: string;
  period: string;
  value: number;
  unit: string;
  sourceName: string;
  url: string;
  sample: boolean;
}

export async function loadMetricPoints(): Promise<MetricRow[]> {
  const rows = await sql<{
    metric: string; segment: string; period: string; value: string; unit: string; source_name: string; url: string; sample: boolean;
  }[]>`
    SELECT metric, segment, period, value::text, unit, source_name, url, sample
    FROM metric_points
    ORDER BY metric, segment, period`;
  return rows.map((row) => ({
    metric: row.metric,
    segment: row.segment,
    period: row.period,
    value: Number(row.value),
    unit: row.unit,
    sourceName: row.source_name,
    url: row.url,
    sample: row.sample,
  }));
}
