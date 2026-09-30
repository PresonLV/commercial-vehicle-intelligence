// Model fallback for figures the deterministic parser missed. Publish itself never calls a model.
// A suggestion is stored only when the number, unit and segment appear in the article, and it stays
// out of the public table until an admin marks it reviewed.
import { z } from "zod";
import { acceptLiteralMetrics } from "@aihot/industry/metrics";
import { sql } from "../db.ts";
import { config } from "../config.ts";
import { modelFor } from "../editorial/models.ts";
import { promptText, promptVersion } from "../editorial/prompts.ts";
import { chatJson } from "../providers/llm.ts";
import { completeReceipt } from "../providers/receipts.ts";

const PROMPT = promptVersion("metric-extract");
const SYSTEM = promptText("metric-extract");
const Schema = z.object({
  rows: z.array(z.object({
    metric: z.string(),
    segment: z.string(),
    brand: z.string().catch(""),
    period: z.string(),
    value: z.number(),
    unit: z.string(),
  })).catch([]),
});

export async function fillMetricFallback(articleId: string): Promise<{ added: number }> {
  if (!config.modelCallsEnabled) return { added: 0 };
  const [row] = await sql<{
    text: string; url: string; source_name: string; category: string | null; tags: string[]; ready: number;
  }[]>`
    SELECT concat_ws(E'\n', a.title, a.body_text) AS text, a.url, s.name AS source_name,
           an.category, an.tags,
           (SELECT count(*) FROM metric_points m WHERE m.article_id = a.id AND m.confidence = 'high' AND NOT m.sample) AS ready
    FROM articles a
    JOIN sources s ON s.id = a.source_id
    LEFT JOIN LATERAL (
      SELECT category, tags FROM analyses WHERE article_id = a.id ORDER BY input_revision DESC, id DESC LIMIT 1
    ) an ON true
    WHERE a.id = ${articleId}`;
  if (!row || row.ready > 0) return { added: 0 };
  if (row.category !== "data" && !(row.tags ?? []).includes("销量数据")) return { added: 0 };
  if (!/(上牌|交强险|万辆|万台|批发|产量|销量)/.test(row.text)) return { added: 0 };
  const res = await chatJson({
    model: await modelFor("metric"), purpose: "metric_extract", subject: `metrics:${articleId}`, promptVersion: PROMPT,
    system: SYSTEM, user: row.text.slice(0, 12000), schema: Schema, temperature: 0, maxTokens: 1200,
  });
  const accepted = acceptLiteralMetrics(row.text, res.data.rows);
  await sql.begin(async (tx) => {
    for (const point of accepted) {
      await tx`
        INSERT INTO metric_points (metric, segment, brand, period, value, unit, source_name, url, article_id, sample, method, confidence)
        VALUES (${point.metric}, ${point.segment}, ${point.brand}, ${point.period}, ${point.value}, ${point.unit}, ${row.source_name}, ${row.url}, ${articleId}, false, 'llm', 'review')
        ON CONFLICT (metric, segment, brand, period, url) DO NOTHING`;
    }
    await completeReceipt(tx, res.receiptId);
  });
  return { added: accepted.length };
}
