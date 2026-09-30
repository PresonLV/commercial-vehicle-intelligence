// Figures copied out of a data article. Readers never trigger this; publish does, after the text is stored.
import { extractMetricPoints } from "@aihot/industry/metrics";
import type { Tx } from "../db.ts";

export async function syncMetricPoints(tx: Tx, input: {
  articleId: string;
  category: string | null;
  tags: string[];
  text: string;
  sourceName: string;
  url: string;
}): Promise<void> {
  await tx`DELETE FROM metric_points WHERE article_id = ${input.articleId} AND NOT sample`;
  const wanted = input.category === "data" || input.tags.includes("销量数据");
  if (!wanted) return;
  for (const point of extractMetricPoints(input.text)) {
    await tx`
      INSERT INTO metric_points (metric, segment, period, value, unit, source_name, url, article_id, sample)
      VALUES (${point.metric}, ${point.segment}, ${point.period}, ${point.value}, ${point.unit}, ${input.sourceName}, ${input.url}, ${input.articleId}, false)
      ON CONFLICT (metric, segment, period, url) DO UPDATE SET
        value = EXCLUDED.value, unit = EXCLUDED.unit, source_name = EXCLUDED.source_name, article_id = EXCLUDED.article_id`;
  }
}
