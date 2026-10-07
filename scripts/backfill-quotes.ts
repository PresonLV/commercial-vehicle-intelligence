// Replace rows previously loaded from industry/quote-seed.ts. Safe to re-run.
// Manual rows and weekly fetches are left in place. 【样例】 rows are replaced with the sample list.
import { QUOTE_SAMPLES, QUOTE_SEED } from "@aihot/industry/quote-seed";
import { closeDb, sql } from "@aihot/backend/db";

await sql.begin(async (tx) => {
  await tx`DELETE FROM truck_quotes WHERE method IN ('seed', 'sample')`;
  for (const row of QUOTE_SEED) {
    await tx`
      INSERT INTO truck_quotes (
        brand, series, model_name, segment, drive, engine_brand, horsepower, gearbox, power_type, emission,
        kind, price_wan, price_date, observed_on, source_name, url, excerpt, confidence, method, sample
      ) VALUES (
        ${row.brand}, ${row.series}, ${row.modelName}, ${row.segment}, ${row.drive}, ${row.engineBrand}, ${row.horsepower},
        ${row.gearbox}, ${row.powerType}, ${row.emission}, ${row.kind}, ${row.priceWan}, ${row.priceDate}, ${row.observedOn},
        ${row.sourceName}, ${row.url}, ${row.excerpt}, 'high', 'seed', false
      )`;
  }
  for (const row of QUOTE_SAMPLES) {
    await tx`
      INSERT INTO truck_quotes (
        brand, series, model_name, segment, drive, engine_brand, horsepower, gearbox, power_type, emission,
        kind, price_wan, price_date, observed_on, source_name, url, excerpt, confidence, method, sample
      ) VALUES (
        ${row.brand}, ${row.series}, ${row.modelName}, ${row.segment}, ${row.drive}, ${row.engineBrand}, ${row.horsepower},
        ${row.gearbox}, ${row.powerType}, ${row.emission}, ${row.kind}, ${row.priceWan}, ${row.priceDate}, ${row.observedOn},
        ${row.sourceName}, ${row.url}, ${row.excerpt}, 'high', 'sample', true
      )`;
  }
});
console.log(`seeded ${QUOTE_SEED.length} quote rows and ${QUOTE_SAMPLES.length} samples`);
await closeDb();
