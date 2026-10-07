import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseQuoteCsv } from "@aihot/industry/quote-csv";
import { parseChinatruckList, parseChinatruckProduct, readConfigPrice, seriesOf, brandOf } from "@aihot/industry/quote-parse";
import { QUOTE_SEED } from "@aihot/industry/quote-seed";
import { applyQuoteFilter, groupQuotes, visibleQuotes, type QuoteViewPoint } from "@aihot/industry/quote-view";

const fixture = readFileSync(new URL("./fixtures/chinatruck-product.html", import.meta.url), "utf8");

test("a 卡车网 product page keeps the printed guide price and spec labels", () => {
  const parsed = parseChinatruckProduct(fixture);
  assert.ok(parsed);
  assert.equal(parsed.confidence, "high");
  assert.equal(parsed.brand, "一汽解放");
  assert.equal(parsed.series, "J7");
  assert.equal(parsed.segment, "重卡牵引车");
  assert.equal(parsed.msrpWan, 54.7);
  assert.equal(parsed.msrpLiteral, "54.70 万元");
  assert.equal(parsed.horsepower, 600);
  assert.equal(parsed.engineBrand, "锡柴");
  assert.equal(parsed.powerType, "LNG");
  assert.equal(parsed.gearbox, "采埃孚ZF12TX2821TD");
  assert.equal(parsed.dealerWan, null);
  assert.ok(parsed.excerpt.includes("54.70 万元"));
  assert.equal(parsed.excerpt.includes("卡车网卡车报价栏目"), false);
});

test("a price range and a missing price are not one config", () => {
  assert.equal(readConfigPrice("53.12-58.32万").level, "none");
  assert.equal(readConfigPrice("暂无").level, "none");
  assert.equal(readConfigPrice("54.70").level, "review");
  const missing = parseChinatruckProduct(`<div class="car-name h10">一汽解放 J7重卡 牵引车</div><p>厂商指导价：<span>暂无</span></p>`);
  assert.equal(missing?.msrpWan, null);
  assert.equal(missing?.confidence, "none");
  const bare = parseChinatruckProduct(`<div class="car-name h10">一汽解放 J7重卡 牵引车</div><p>厂商指导价：<span>54.70</span></p><li><span>吨位级别：</span>重卡</li>`);
  assert.equal(bare?.confidence, "review");
});

test("announcement codes are not read as the series", () => {
  assert.equal(seriesOf("北奔重卡 V3重卡 卓越版 460马力 6X4 国六 LNG牵引车(ND4250BG6J7Z01)"), "V3");
  assert.equal(brandOf("北奔重卡 V3重卡 卓越版 460马力 6X4 国六 LNG牵引车(ND4250BG6J7Z01)"), "北奔");
  assert.equal(seriesOf("中国重汽 HOWO TX重卡 440马力 6X4 LNG 国六 牵引车(ZZ4257V384GF1CW)"), "豪沃TX");
  assert.equal(brandOf("江铃重汽 威龙重卡 530马力 6X4 国六 牵引车(SXQ4250J4B4D6)"), "江铃");
  assert.equal(seriesOf("江铃重汽 威龙重卡 530马力 6X4 国六 牵引车(SXQ4250J4B4D6)"), "威龙");
});

test("a series table points at product pages that print a number", () => {
  const html = `<tr class="tbody"><td><a href="https://www.chinatruck.org/product/truck/100793.html" title="一汽解放 J7">一汽解放 J7</a></td><td><span class="price">54.70</span></td></tr>
<tr class="tbody"><td><a href="https://www.chinatruck.org/product/truck/1.html" title="暂无款">暂无款</a></td><td><span class="price">暂无</span></td></tr>`;
  const rows = parseChinatruckList(html);
  assert.equal(rows.length, 2);
  assert.equal(rows[0]!.url.endsWith("/100793.html"), true);
  assert.equal(rows[1]!.priceText, "暂无");
});

test("seeded guide prices quote the config and hide the sample once real rows exist", () => {
  assert.ok(QUOTE_SEED.length >= 30);
  const urls = new Set<string>();
  for (const row of QUOTE_SEED) {
    assert.equal(row.sample ?? false, false);
    assert.equal(row.kind, "msrp");
    assert.equal(row.sourceName, "卡车网");
    assert.match(row.url, /^https:\/\/www\.chinatruck\.org\/product\/truck\/\d+\.html$/);
    assert.equal(urls.has(row.url), false);
    urls.add(row.url);
    assert.ok(row.excerpt.includes(row.modelName));
    assert.ok(row.excerpt.includes("万元"));
    assert.ok(row.priceWan > 0);
  }
  const sample: QuoteViewPoint = {
    brand: "一汽解放", series: "J7", modelName: "【样例】", segment: "重卡牵引车", drive: "6X4", engineBrand: "", horsepower: 1,
    gearbox: "", powerType: "柴油", emission: "", kind: "msrp", priceWan: 1, priceDate: null, observedOn: "2026-10-07",
    sourceName: "预览样例", url: "https://example.com/quote-sample-j7", excerpt: "【样例】", sample: true,
  };
  const real = { ...sample, sample: false, priceWan: 54.7, url: QUOTE_SEED[0]!.url, sourceName: "卡车网" };
  assert.equal(visibleQuotes([sample, real]).some((row) => row.sample), false);
  assert.equal(visibleQuotes([sample]).length, 1);
  const models = groupQuotes(visibleQuotes([real, { ...real, observedOn: "2026-10-14", priceWan: 55 }]));
  assert.equal(models[0]!.history.length, 2);
  assert.equal(models[0]!.msrp?.priceWan, 55);
  const lng = groupQuotes(QUOTE_SEED.map((row) => ({ ...row, sample: false })));
  const energy = applyQuoteFilter(lng, { segment: "新能源", brand: "", power: "", hpMin: null, hpMax: null, priceMin: null, priceMax: null, sort: "price-asc" });
  assert.ok(energy.length > 0);
  assert.ok(energy.every((model) => model.powerType === "LNG" || model.powerType === "纯电" || model.powerType === "换电" || model.powerType === "氢燃料"));
  assert.ok(energy.every((model, index) => index === 0 || (energy[index - 1]!.msrp?.priceWan ?? 0) <= (model.msrp?.priceWan ?? 0)));
});

test("quote CSV rejects a row without a link", () => {
  const header = "brand,series,model_name,segment,drive,engine_brand,horsepower,gearbox,power_type,emission,kind,price_wan,price_date,observed_on,source_name,url";
  const ok = parseQuoteCsv(`${header}\n一汽解放,J7,解放J7,重卡牵引车,6X4,锡柴,600,采埃孚,LNG,国六,msrp,54.70,,2026-10-07,卡车网,https://www.chinatruck.org/product/truck/100793.html`);
  assert.equal(ok.errors.length, 0);
  assert.equal(ok.rows[0]!.priceWan, 54.7);
  const bad = parseQuoteCsv(`${header}\n一汽解放,J7,解放J7,重卡牵引车,6X4,锡柴,600,采埃孚,LNG,国六,msrp,54.70,,2026-10-07,卡车网,`);
  assert.ok(bad.errors.length > 0);
});

test("collection off does not fetch truck prices", async () => {
  const previous = process.env.COLLECT_ENABLED;
  process.env.COLLECT_ENABLED = "false";
  try {
    const { refreshTruckQuotes } = await import("@aihot/backend/quotes/refresh");
    const result = await refreshTruckQuotes(async () => {
      throw new Error("network");
    });
    assert.deepEqual(result, { skipped: true, inserted: 0, review: 0 });
  } finally {
    if (previous === undefined) delete process.env.COLLECT_ENABLED;
    else process.env.COLLECT_ENABLED = previous;
  }
});
