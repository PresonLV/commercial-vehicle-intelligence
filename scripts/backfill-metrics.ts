// Replace rows previously loaded from industry/metric-seed.ts. Safe to re-run.
// Article extracts and 【样例】 rows are left in place.
import { canonicalBrand } from "@aihot/industry/metric-alias";
import { METRIC_SEED } from "@aihot/industry/metric-seed";
import { closeDb, sql } from "@aihot/backend/db";

await sql.begin(async (tx) => {
  await tx`DELETE FROM metric_points WHERE method = 'seed'`;
  for (const row of METRIC_SEED) {
    await tx`
      INSERT INTO metric_points (metric, segment, brand, brand_text, period, grain, value, unit, source_name, url, page, article_id, sample, method, confidence)
      VALUES (${row.metric}, ${row.segment}, ${canonicalBrand(row.brand)}, ${row.brandText || row.brand}, ${row.period}, ${row.grain}, ${row.value}, ${row.unit}, ${row.sourceName}, ${row.url}, ${row.page ?? ""}, NULL, false, 'seed', 'high')`;
  }
});
console.log(`seeded ${METRIC_SEED.length} metric rows`);
await closeDb();
