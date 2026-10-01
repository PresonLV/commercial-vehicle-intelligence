// Replace rows previously loaded from industry/metric-seed.ts. Safe to re-run.
// Article extracts and 【样例】 rows are left in place.
import { METRIC_SEED } from "@aihot/industry/metric-seed";
import { closeDb, sql } from "@aihot/backend/db";

await sql.begin(async (tx) => {
  await tx`DELETE FROM metric_points WHERE method = 'seed'`;
  for (const row of METRIC_SEED) {
    await tx`
      INSERT INTO metric_points (metric, segment, brand, period, grain, value, unit, source_name, url, article_id, sample, method, confidence)
      VALUES (${row.metric}, ${row.segment}, ${row.brand}, ${row.period}, ${row.grain}, ${row.value}, ${row.unit}, ${row.sourceName}, ${row.url}, NULL, false, 'seed', 'high')`;
  }
});
console.log(`seeded ${METRIC_SEED.length} metric rows`);
await closeDb();
