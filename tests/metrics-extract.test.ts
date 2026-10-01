import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { acceptLiteralMetrics, extractFigures, extractMetricPoints, parseMetricCsv } from "@aihot/industry/metrics";
import { unwrapCdata } from "@aihot/backend/sources/web-list";

const read = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

test("a Foton monthly PDF keeps this month's sales and output and drops the running total", () => {
  const rows = extractFigures(read("foton-2026-08.txt"));
  const pick = (metric: string, segment: string, brand = "") => rows.find((row) => row.metric === metric && row.segment === segment && row.brand === brand);
  assert.equal(pick("sales", "中重型货车")?.value, 12817);
  assert.equal(pick("production", "中重型货车")?.value, 11824);
  assert.equal(pick("sales", "轻型货车")?.value, 32900);
  assert.equal(pick("production", "新能源汽车")?.value, 12010);
  assert.equal(pick("sales", "发动机", "福康")?.value, 10031);
  assert.equal(pick("sales", "发动机", "福康")?.unit, "台");
  assert.equal(pick("sales", "重型货车", "福戴")?.value, 7121);
  assert.equal(rows.some((row) => row.segment === "乘用车" || row.value === 50565 || row.value === 126522), false);
});

test("Find800 monthly copy keeps stated levels and leaves growth rates and cumulative totals", () => {
  const rows = extractFigures(read("find800-2026-08.txt"));
  const heavy = rows.find((row) => row.segment === "重卡" && row.brand === "");
  assert.equal(heavy?.value, 4.6);
  assert.equal(heavy?.unit, "万辆");
  assert.equal(rows.find((row) => row.brand === "解放")?.value, 9187);
  assert.equal(rows.find((row) => row.brand === "福田")?.value, 6340);
  assert.equal(rows.find((row) => row.segment === "轻卡")?.value, 15.7);
  assert.equal(rows.find((row) => row.segment === "商用车")?.value, 32.8);
  assert.equal(rows.some((row) => row.value === 1.3 || row.value === 10 || row.value === 22.2), false);
  assert.equal(extractMetricPoints("协会称 2026年8月重卡销量12.3万辆，轻卡销量8万辆。").length, 2);
});

test("a model figure is kept only when the number is written next to its unit", () => {
  const source = read("find800-2026-08.txt");
  const kept = acceptLiteralMetrics(source, [
    { metric: "sales", segment: "重卡", period: "2026-08", value: 4.6, unit: "万辆" },
    { metric: "sales", segment: "重卡", period: "2026-08", value: 99, unit: "万辆" },
    { metric: "insurance", segment: "重卡", period: "2026-08", value: 4.6, unit: "万辆" },
  ]);
  assert.equal(kept.length, 1);
  assert.equal(kept[0]?.method, "llm");
  assert.equal(kept[0]?.metric, "sales");
});

test("an HTML table uses the header's metric and skips a year-on-year column", () => {
  const html = `<table><tr><th>产品</th><th>2026年8月销量（辆）</th><th>同比</th></tr><tr><td>轻卡</td><td>157000</td><td>12%</td></tr></table>`;
  const rows = extractFigures("", html);
  assert.deepEqual(rows.map((row) => [row.metric, row.segment, row.value, row.unit]), [["sales", "轻卡", 157000, "辆"]]);
});

test("manual CSV rejects a row that is not a real figure", () => {
  const ok = parseMetricCsv("metric,segment,brand,period,value,unit,source_name,url\nsales,重卡,,2026-08,4.6,万辆,方得网,https://www.find800.cn/news/168789/248\n");
  assert.equal(ok.errors.length, 0);
  assert.equal(ok.rows[0]?.value, 4.6);
  const bad = parseMetricCsv("metric,segment,brand,period,value,unit,source_name,url\nguess,重卡,,8月,很多,辆,某媒体,note\n");
  assert.ok(bad.errors.length > 0);
  assert.equal(bad.rows.length, 0);
});

test("a Hanweb listing unwraps the record markup", () => {
  const raw = `<record><![CDATA[<a href="http://gxt.shandong.gov.cn/art/2026/9/28/art_15201_1.html">关于商用车的通知</a>]]></record>`;
  assert.match(unwrapCdata(raw), /href="http:\/\/gxt.shandong.gov.cn\/art\/2026\/9\/28/);
});
