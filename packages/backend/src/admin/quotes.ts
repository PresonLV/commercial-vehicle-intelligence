// Manual truck prices. Readers never type these; an admin does, and the audit log keeps the reason.
import { parseQuoteCsv, QUOTE_CSV_HEADER, type ManualQuoteRow } from "@aihot/industry/quote-csv";
import { sql } from "../db.ts";
import { audit } from "./auth.ts";

function bad(message: string): Error {
  return Object.assign(new Error(message), { statusCode: 400 });
}

export async function listAdminQuotes() {
  const rows = await sql<{
    id: string; brand: string; series: string; model_name: string; segment: string; kind: string; price_wan: string;
    price_date: string | null; observed_on: string; source_name: string; url: string; sample: boolean; method: string; confidence: string; excerpt: string;
  }[]>`
    SELECT id, brand, series, model_name, segment, kind, price_wan::text, price_date::text, observed_on::text,
      source_name, url, sample, method, confidence, excerpt
    FROM truck_quotes
    ORDER BY confidence, observed_on DESC, id DESC
    LIMIT 200`;
  return {
    header: QUOTE_CSV_HEADER.join(","),
    rows: rows.map((row) => ({ ...row, id: String(row.id), price_wan: Number(row.price_wan) })),
  };
}

async function insertManual(row: ManualQuoteRow, actor: string, reason: string) {
  const [saved] = await sql<{ id: string }[]>`
    INSERT INTO truck_quotes (
      brand, series, model_name, segment, drive, engine_brand, horsepower, gearbox, power_type, emission,
      kind, price_wan, price_date, observed_on, source_name, url, excerpt, confidence, method, sample
    ) VALUES (
      ${row.brand}, ${row.series}, ${row.modelName}, ${row.segment}, ${row.drive}, ${row.engineBrand}, ${row.horsepower},
      ${row.gearbox}, ${row.powerType}, ${row.emission}, ${row.kind}, ${row.priceWan}, ${row.priceDate}, ${row.observedOn},
      ${row.sourceName}, ${row.url}, ${`${row.modelName}；${row.kind === "msrp" ? "厂商指导价" : "经销商报价"}：${row.priceWan}万元`},
      'high', 'manual', false
    )
    ON CONFLICT (url, kind, observed_on) DO UPDATE SET
      brand = EXCLUDED.brand, series = EXCLUDED.series, model_name = EXCLUDED.model_name, segment = EXCLUDED.segment,
      drive = EXCLUDED.drive, engine_brand = EXCLUDED.engine_brand, horsepower = EXCLUDED.horsepower, gearbox = EXCLUDED.gearbox,
      power_type = EXCLUDED.power_type, emission = EXCLUDED.emission, price_wan = EXCLUDED.price_wan, price_date = EXCLUDED.price_date,
      source_name = EXCLUDED.source_name, excerpt = EXCLUDED.excerpt, method = 'manual', confidence = 'high', sample = false
    RETURNING id`;
  await audit(actor, "quote.manual", saved ? String(saved.id) : row.url, reason, null, row);
  return saved?.id ?? null;
}

export async function addManualQuote(input: ManualQuoteRow & { reason?: string }, actor: string) {
  const reason = String(input.reason ?? "").trim();
  if (!reason) throw bad("需要填写原因");
  const parsed = parseQuoteCsv([
    QUOTE_CSV_HEADER.join(","),
    [input.brand, input.series, input.modelName, input.segment, input.drive, input.engineBrand, input.horsepower == null ? "" : String(input.horsepower), input.gearbox, input.powerType, input.emission, input.kind, String(input.priceWan), input.priceDate ?? "", input.observedOn, input.sourceName, input.url].join(","),
  ].join("\n"));
  if (parsed.errors.length || parsed.rows.length !== 1) throw bad(parsed.errors[0] ?? "这一行不能入库");
  const id = await insertManual(parsed.rows[0]!, actor, reason);
  return { id };
}

export async function importQuoteCsv(csv: string, reason: string, actor: string) {
  if (!reason.trim()) throw bad("需要填写原因");
  const parsed = parseQuoteCsv(csv);
  if (parsed.errors.length) throw bad(parsed.errors.slice(0, 8).join("；"));
  if (!parsed.rows.length) throw bad("没有可入库的行");
  const ids: Array<string | null> = [];
  for (const row of parsed.rows) ids.push(await insertManual(row, actor, reason.trim()));
  return { imported: ids.length };
}

export async function approveQuote(id: string, reason: string, actor: string) {
  if (!reason.trim()) throw bad("需要填写原因");
  const [row] = await sql<{ id: string }[]>`
    UPDATE truck_quotes SET confidence = 'high'
    WHERE id = ${id} AND confidence = 'review'
    RETURNING id`;
  if (!row) return null;
  await audit(actor, "quote.review", String(row.id), reason.trim(), { confidence: "review" }, { confidence: "high" });
  return { id: String(row.id) };
}
