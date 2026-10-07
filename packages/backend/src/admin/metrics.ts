// Manual figures. Readers never type these; an admin does, and the audit log keeps the reason.
import { canonicalBrand } from "@aihot/industry/metric-alias";
import { METRIC_LABELS, parseMetricCsv, type ManualMetricRow } from "@aihot/industry/metrics";
import { sql } from "../db.ts";
import { audit } from "./auth.ts";

function bad(message: string): Error {
  return Object.assign(new Error(message), { statusCode: 400 });
}

export async function listAdminMetrics() {
  const rows = await sql<{
    id: string; metric: string; segment: string; brand: string; period: string; grain: "month" | "year" | "ytd"; value: string; unit: string;
    source_name: string; url: string; sample: boolean; method: string; confidence: string;
  }[]>`
    SELECT id, metric, segment, brand, period, grain, value::text, unit, source_name, url, sample, method, confidence
    FROM metric_points
    ORDER BY confidence, period DESC, id DESC
    LIMIT 200`;
  return {
    metrics: METRIC_LABELS,
    rows: rows.map((row) => ({ ...row, id: String(row.id), value: Number(row.value) })),
  };
}

async function insertManual(row: ManualMetricRow, actor: string, reason: string) {
  const [saved] = await sql<{ id: string }[]>`
    INSERT INTO metric_points (metric, segment, brand, brand_text, period, grain, value, unit, source_name, url, page, article_id, sample, method, confidence)
    VALUES (${row.metric}, ${row.segment}, ${canonicalBrand(row.brand)}, ${row.brand}, ${row.period}, ${row.grain}, ${row.value}, ${row.unit}, ${row.sourceName}, ${row.url}, '', NULL, false, 'manual', 'high')
    ON CONFLICT (metric, segment, brand, period, grain, url) DO UPDATE SET
      value = EXCLUDED.value, unit = EXCLUDED.unit, source_name = EXCLUDED.source_name, method = 'manual', confidence = 'high'
    RETURNING id`;
  await audit(actor, "metric.manual", saved ? String(saved.id) : row.url, reason, null, row);
  return saved?.id ?? null;
}

export async function addManualMetric(input: ManualMetricRow & { reason?: string }, actor: string) {
  const reason = String(input.reason ?? "").trim();
  if (!reason) throw bad("需要填写原因");
  const parsed = parseMetricCsv(["metric,segment,brand,period,grain,value,unit,source_name,url", [
    input.metric, input.segment, input.brand ?? "", input.period, input.grain || "month", String(input.value), input.unit, input.sourceName, input.url,
  ].map(csvCell).join(",")].join("\n"));
  if (parsed.errors.length || parsed.rows.length !== 1) throw bad(parsed.errors[0] ?? "这一行不能入库");
  const id = await insertManual(parsed.rows[0]!, actor, reason);
  return { id };
}

export async function importMetricCsv(csv: string, reason: string, actor: string) {
  if (!reason.trim()) throw bad("需要填写原因");
  const parsed = parseMetricCsv(csv);
  if (parsed.errors.length) throw bad(parsed.errors.slice(0, 8).join("；"));
  if (!parsed.rows.length) throw bad("没有可入库的行");
  const ids: Array<string | null> = [];
  for (const row of parsed.rows) ids.push(await insertManual(row, actor, reason.trim()));
  return { imported: ids.length };
}

export async function approveMetric(id: string, reason: string, actor: string) {
  if (!reason.trim()) throw bad("需要填写原因");
  const [row] = await sql<{ id: string; confidence: string }[]>`
    UPDATE metric_points SET confidence = 'high'
    WHERE id = ${id} AND confidence = 'review'
    RETURNING id, confidence`;
  if (!row) return null;
  await audit(actor, "metric.review", String(row.id), reason.trim(), { confidence: "review" }, { confidence: "high" });
  return { id: String(row.id) };
}

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
