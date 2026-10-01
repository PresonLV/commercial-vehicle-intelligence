import assert from "node:assert/strict";
import { test } from "node:test";
import { canonicalBrand } from "@aihot/industry/metric-alias";
import { parseMetricCsv } from "@aihot/industry/metrics";
import { METRIC_SEED } from "@aihot/industry/metric-seed";
import { parseCaamStatistics, reviewBulletin } from "@aihot/industry/metrics-bulletin";
import { scaleWan } from "@aihot/industry/metric-units";
import { annualSeries, brandRank, brandRankNormalized, readYtd, readYtdAt, visiblePoints, ytdChange, type MetricViewPoint } from "@aihot/industry/metrics-view";

function numbersMatch(compact: string, value: number): boolean {
  for (const match of compact.matchAll(/(?<![\d.])(\d+(?:\.\d+)?)(?![\d.])(?:\s*%)?/g)) {
    if (match[0].includes("%")) continue;
    if (Number(match[1]) === value) return true;
  }
  return false;
}

function excerptHas(excerpt: string, value: number, unit: string): boolean {
  const compact = excerpt.replace(/,/g, "").replace(/輛/g, "辆").replace(/臺/g, "台");
  const adjacent = new RegExp(`(?<![\\d.])(\\d+(?:\\.\\d+)?)\\s*${unit}`, "g");
  for (const match of compact.matchAll(adjacent)) {
    if (Number(match[1]) === value) return true;
  }
  if (unit === "台") {
    for (const match of compact.matchAll(/(?<![\d.])(\d+(?:\.\d+)?)\s*units\b/gi)) {
      if (Number(match[1]) === value) return true;
    }
  }
  for (const line of compact.split("\n")) {
    if (!line.includes(unit)) continue;
    if (numbersMatch(line, value)) return true;
  }
  // A bare 辆 or 台 (not 万辆 / 万台) on a filing table covers the other numbers in that excerpt.
  if ((unit === "辆" || unit === "台") && new RegExp(`(?<![万\\d.])${unit}(?![\\u4e00-\\u9fff])`).test(compact)) {
    if (numbersMatch(compact, value)) return true;
  }
  const header = (unit === "万辆" && /Unit:\s*10000/.test(excerpt)) || new RegExp(`单位[：:]\\s*${unit}`).test(excerpt);
  if (!header) return false;
  return numbersMatch(compact, value);
}

test("every seeded figure is written in its excerpt, once per series", () => {
  const seen = new Set<string>();
  for (const row of METRIC_SEED) {
    assert.ok(excerptHas(row.excerpt, row.value, row.unit), `${row.segment} ${row.brand} ${row.period} ${row.value}${row.unit}`);
    if (row.brand) {
      const original = row.brandText && row.brandText !== row.brand ? row.brandText : row.brand;
      assert.ok(row.excerpt.includes(row.brand) || row.excerpt.includes(original), row.brand);
    }
    assert.match(row.url, /^https?:\/\//);
    const key = [row.metric, row.segment, row.brand, row.period, row.grain, row.unit].join("|");
    assert.equal(seen.has(key), false, key);
    seen.add(key);
  }
  assert.ok(METRIC_SEED.length > 100);
});

test("a cited 1-8 month total is not replaced by August or September alone", () => {
  const cited: MetricViewPoint = {
    metric: "sales", segment: "商用车", brand: "", period: "2026-08", grain: "ytd",
    value: 294.2, unit: "万辆", sourceName: "EV视界", url: "https://example.com/ytd", sample: false,
  };
  const august: MetricViewPoint = { ...cited, grain: "month", value: 32.8, url: "https://example.com/aug" };
  const onlyAugust = readYtd([cited, august], { metric: "sales", segment: "商用车", brand: "", year: "2026", unit: "万辆" });
  assert.equal(onlyAugust.basis, "cited");
  assert.equal(onlyAugust.value, 294.2);
  assert.deepEqual(onlyAugust.missingMonths, [1, 2, 3, 4, 5, 6, 7]);
  const september: MetricViewPoint = { ...august, period: "2026-09", value: 30 };
  const withSeptember = readYtd([cited, august, september], { metric: "sales", segment: "商用车", brand: "", year: "2026", unit: "万辆" });
  assert.equal(withSeptember.basis, "cited");
  assert.equal(withSeptember.endMonth, 8);
});

test("January through a later month replaces an older cited cumulative", () => {
  const points: MetricViewPoint[] = [];
  for (let month = 1; month <= 9; month++) {
    points.push({
      metric: "sales", segment: "商用车", brand: "", period: `2026-${String(month).padStart(2, "0")}`, grain: "month",
      value: 10, unit: "万辆", sourceName: "甲", url: `https://example.com/${month}`, sample: false,
    });
  }
  points.push({
    metric: "sales", segment: "商用车", brand: "", period: "2026-08", grain: "ytd",
    value: 294.2, unit: "万辆", sourceName: "乙", url: "https://example.com/ytd", sample: false,
  });
  const reading = readYtd(points, { metric: "sales", segment: "商用车", brand: "", year: "2026", unit: "万辆" });
  assert.equal(reading.basis, "sum");
  assert.equal(reading.endMonth, 9);
  assert.equal(reading.value, 90);
  const prior = readYtd([], { metric: "sales", segment: "商用车", brand: "", year: "2025", unit: "万辆" });
  assert.equal(ytdChange(reading, prior), null);
});

test("brand share stays inside one unit", () => {
  const points: MetricViewPoint[] = [
    { metric: "sales", segment: "重卡", brand: "", period: "2024", grain: "year", value: 60.24, unit: "万辆", sourceName: "甲", url: "https://example.com/t", sample: false },
    { metric: "sales", segment: "重卡", brand: "解放", period: "2024", grain: "year", value: 14.27, unit: "万辆", sourceName: "甲", url: "https://example.com/a", sample: false },
    { metric: "sales", segment: "重卡", brand: "东风", period: "2024", grain: "year", value: 12.47, unit: "万辆", sourceName: "甲", url: "https://example.com/b", sample: false },
    { metric: "sales", segment: "重卡", brand: "红岩", period: "2024", grain: "year", value: 8331, unit: "辆", sourceName: "甲", url: "https://example.com/c", sample: false },
  ];
  const wan = brandRank(points, { metric: "sales", segment: "重卡", period: "2024", grain: "year", unit: "万辆" });
  assert.equal(wan.rows.length, 2);
  assert.ok(wan.rows[0]!.totalShare !== null);
  const liang = brandRank(points, { metric: "sales", segment: "重卡", period: "2024", grain: "year", unit: "辆" });
  assert.equal(liang.total, null);
  assert.equal(liang.rows[0]!.totalShare, null);
  assert.equal(liang.rows[0]!.listShare, 1);
});

test("sample rows hide once the same metric has a real figure", () => {
  const points: MetricViewPoint[] = [
    { metric: "sales", segment: "重卡", brand: "", period: "2026-08", grain: "month", value: 1111, unit: "万辆", sourceName: "预览样例", url: "https://example.com/s", sample: true },
    { metric: "sales", segment: "商用车", brand: "", period: "2025", grain: "year", value: 429.6, unit: "万辆", sourceName: "甲", url: "https://example.com/r", sample: false },
    { metric: "insurance", segment: "重卡", brand: "", period: "2026-08", grain: "month", value: 1, unit: "万辆", sourceName: "预览样例", url: "https://example.com/i", sample: true },
  ];
  const visible = visiblePoints(points);
  assert.equal(visible.some((point) => point.sample && point.metric === "sales"), false);
  assert.equal(visible.some((point) => point.metric === "insurance"), true);
  assert.equal(annualSeries(visible, { metric: "sales", segment: "商用车", brand: "" }).length, 1);
});

test("aliases merge the short name and leave a different company alone", () => {
  assert.equal(canonicalBrand("解放"), "一汽解放");
  assert.equal(canonicalBrand("中国重汽集团"), "中国重汽");
  assert.equal(canonicalBrand("东风汽车股份"), "东风汽车股份");
  assert.equal(canonicalBrand("福田康明斯"), "福田康明斯");
});

test("万 scales by 10000 without rounding a four-decimal figure", () => {
  assert.equal(scaleWan(429.6), 4296000);
  assert.equal(scaleWan(24.5031), 245031);
});

test("prior-year cumulative is pinned to the same end month", () => {
  const points: MetricViewPoint[] = [
    { metric: "sales", segment: "商用车", brand: "", period: "2026-08", grain: "ytd", value: 291.6, unit: "万辆", sourceName: "甲", url: "https://example.com/2026", sample: false },
    { metric: "sales", segment: "商用车", brand: "", period: "2025", grain: "year", value: 429.6, unit: "万辆", sourceName: "甲", url: "https://example.com/2025", sample: false },
    { metric: "sales", segment: "商用车", brand: "", period: "2025-06", grain: "ytd", value: 200, unit: "万辆", sourceName: "甲", url: "https://example.com/2025-06", sample: false },
  ];
  const current = readYtd(points, { metric: "sales", segment: "商用车", brand: "", year: "2026", unit: "万辆" });
  const prior = readYtdAt(points, { metric: "sales", segment: "商用车", brand: "", year: "2025", unit: "万辆" }, current.endMonth ?? 0);
  assert.equal(current.endMonth, 8);
  assert.equal(prior.basis, "none");
  assert.equal(ytdChange(current, prior), null);
  const june = readYtdAt(points, { metric: "sales", segment: "商用车", brand: "", year: "2025", unit: "万辆" }, 6);
  assert.equal(june.value, 200);
});

test("CAAM keeps a December table and drops a month that disagrees with the header", () => {
  const december = parseCaamStatistics(
    "<p>Sales of automobiles in December 2020</p><p>Unit: 10000, %</p><p>Jan. — Dec. Commercial Vehicles (CV) 45.6 513.3 Buses 6.2 44.8 Trucks 39.4 468.5</p>",
    "sales",
  );
  const commercial = december.filter((row) => row.segment === "商用车");
  assert.deepEqual(commercial.map((row) => [row.grain, row.value, row.period]), [
    ["month", 45.6, "2020-12"],
    ["ytd", 513.3, "2020-12"],
    ["year", 513.3, "2020"],
  ]);
  const mismatch = parseCaamStatistics(
    "<p>Sales of automobiles in August 2023</p><p>Unit: 10000, %</p><p>Jan. — Sep. Commercial Vehicles (CV) 36.4 300</p>",
    "sales",
  );
  assert.deepEqual(mismatch, []);
});

test("a loose 产销 sentence is flagged for review", () => {
  const rows = reviewBulletin("2026年6月商用车产销完成40.9万辆");
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.confidence, "review");
  assert.equal(rows[0]?.value, 40.9);
  assert.deepEqual(reviewBulletin("没有数字"), []);
});

test("normalized brand share puts 万辆 and 辆 on one list", () => {
  const points: MetricViewPoint[] = [
    { metric: "sales", segment: "重卡", brand: "", period: "2024", grain: "year", value: 60.24, unit: "万辆", sourceName: "甲", url: "https://example.com/t", sample: false },
    { metric: "sales", segment: "重卡", brand: "解放", period: "2024", grain: "year", value: 14.27, unit: "万辆", sourceName: "甲", url: "https://example.com/a", sample: false },
    { metric: "sales", segment: "重卡", brand: "红岩", period: "2024", grain: "year", value: 8331, unit: "辆", sourceName: "甲", url: "https://example.com/c", sample: false },
  ];
  const ranked = brandRankNormalized(points, { metric: "sales", segment: "重卡", period: "2024", grain: "year" });
  assert.equal(ranked.rows.length, 2);
  assert.equal(ranked.rows[0]!.normValue, 142700);
  assert.equal(ranked.rows[1]!.normValue, 8331);
  assert.ok(Math.abs((ranked.rows[0]!.totalShare ?? 0) - 142700 / 602400) < 1e-9);
});

test("collection off does not fetch monthly bulletins", async () => {
  const previous = process.env.COLLECT_ENABLED;
  process.env.COLLECT_ENABLED = "false";
  try {
    const { appendMonthlyBulletins } = await import("@aihot/backend/metrics/bulletin");
    const result = await appendMonthlyBulletins(async () => {
      throw new Error("network");
    });
    assert.deepEqual(result, { skipped: true, inserted: 0, review: 0 });
  } finally {
    if (previous === undefined) delete process.env.COLLECT_ENABLED;
    else process.env.COLLECT_ENABLED = previous;
  }
});

test("seeded 2026 commercial-vehicle cumulative lines up with 2025 through August", () => {
  const points: MetricViewPoint[] = METRIC_SEED.filter((row) => row.metric === "sales" && row.segment === "商用车" && row.brand === "" && row.unit === "万辆").map((row) => ({
    ...row, sample: false,
  }));
  const current = readYtd(points, { metric: "sales", segment: "商用车", brand: "", year: "2026", unit: "万辆" });
  const prior = readYtdAt(points, { metric: "sales", segment: "商用车", brand: "", year: "2025", unit: "万辆" }, current.endMonth ?? 0);
  assert.equal(current.basis, "cited");
  assert.equal(current.endMonth, 8);
  assert.equal(current.value, 294.2);
  assert.equal(prior.value, 274.4);
  const ratio = ytdChange(current, prior);
  assert.ok(ratio !== null && Math.abs(ratio - (294.2 - 274.4) / 274.4) < 1e-9);
  const years = annualSeries(points, { metric: "sales", segment: "商用车", brand: "", unit: "万辆" }).map((point) => point.period);
  for (const year of ["2016", "2017", "2018", "2019", "2024", "2025"]) assert.ok(years.includes(year), year);
  assert.equal(years.includes("2015"), false);
});

test("a year row can be imported when the CSV names the grain", () => {
  const ok = parseMetricCsv("metric,segment,brand,period,grain,value,unit,source_name,url\nsales,商用车,,2025,year,429.6,万辆,中国商用汽车网,http://cv.ce.cn/a\n");
  assert.equal(ok.errors.length, 0);
  assert.equal(ok.rows[0]?.grain, "year");
  const month = parseMetricCsv("metric,segment,brand,period,value,unit,source_name,url\nsales,重卡,,2026-08,4.6,万辆,方得网,https://www.find800.cn/news/168789/248\n");
  assert.equal(month.rows[0]?.grain, "month");
});
