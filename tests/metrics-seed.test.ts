import assert from "node:assert/strict";
import { test } from "node:test";
import { parseMetricCsv } from "@aihot/industry/metrics";
import { METRIC_SEED } from "@aihot/industry/metric-seed";
import { annualSeries, brandRank, readYtd, visiblePoints, ytdChange, type MetricViewPoint } from "@aihot/industry/metrics-view";

function excerptHas(excerpt: string, value: number, unit: string): boolean {
  const pattern = new RegExp(`(?<![\\d.])(\\d+(?:\\.\\d+)?)\\s*${unit}`, "g");
  for (const match of excerpt.matchAll(pattern)) {
    if (Number(match[1]) === value) return true;
  }
  return false;
}

test("every seeded figure is written in its excerpt, once per series", () => {
  const seen = new Set<string>();
  for (const row of METRIC_SEED) {
    assert.ok(excerptHas(row.excerpt, row.value, row.unit), `${row.segment} ${row.brand} ${row.period} ${row.value}${row.unit}`);
    if (row.brand) assert.ok(row.excerpt.includes(row.brand), row.brand);
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

test("a year row can be imported when the CSV names the grain", () => {
  const ok = parseMetricCsv("metric,segment,brand,period,grain,value,unit,source_name,url\nsales,商用车,,2025,year,429.6,万辆,中国商用汽车网,http://cv.ce.cn/a\n");
  assert.equal(ok.errors.length, 0);
  assert.equal(ok.rows[0]?.grain, "year");
  const month = parseMetricCsv("metric,segment,brand,period,value,unit,source_name,url\nsales,重卡,,2026-08,4.6,万辆,方得网,https://www.find800.cn/news/168789/248\n");
  assert.equal(month.rows[0]?.grain, "month");
});
