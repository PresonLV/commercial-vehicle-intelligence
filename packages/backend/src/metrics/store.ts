// Figures copied out of a data article. Readers never trigger this; publish does, after the text is stored.
import { extractFigures } from "@aihot/industry/metrics";
import type { Tx } from "../db.ts";

export async function syncMetricPoints(tx: Tx, input: {
  articleId: string;
  category: string | null;
  tags: string[];
  text: string;
  html?: string;
  sourceName: string;
  url: string;
}): Promise<void> {
  await tx`DELETE FROM metric_points WHERE article_id = ${input.articleId} AND NOT sample AND method <> 'manual'`;
  const wanted = input.category === "data" || input.tags.includes("销量数据");
  if (!wanted) return;
  for (const point of extractFigures(input.text, input.html ?? "")) {
    if (point.method === "llm") continue;
    await tx`
      INSERT INTO metric_points (metric, segment, brand, period, value, unit, source_name, url, article_id, sample, method, confidence)
      VALUES (${point.metric}, ${point.segment}, ${point.brand}, ${point.period}, ${point.value}, ${point.unit}, ${input.sourceName}, ${input.url}, ${input.articleId}, false, ${point.method}, 'high')
      ON CONFLICT (metric, segment, brand, period, url) DO UPDATE SET
        value = EXCLUDED.value, unit = EXCLUDED.unit, source_name = EXCLUDED.source_name, article_id = EXCLUDED.article_id,
        method = EXCLUDED.method, confidence = 'high'`;
  }
}
