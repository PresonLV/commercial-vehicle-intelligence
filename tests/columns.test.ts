import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canonicalCategory, columnForItemType } from "@aihot/industry/taxonomy";
import { extractMetricPoints } from "@aihot/industry/metrics";
import { policyNotice } from "@aihot/industry/notices";
import { toPublicApiCategory } from "@aihot/contracts/taxonomy";
import { feedCategory } from "@aihot/backend/publication/feeds";
import { noiseFiltered } from "@aihot/backend/sources/collect";
import { fromHtml, htmlAtJsonPath, parseLooseDate } from "@aihot/backend/sources/web-list";

test("export folds into overseas and the column order ends with research", () => {
  assert.equal(canonicalCategory("export"), "overseas");
  assert.equal(toPublicApiCategory("export"), "overseas");
  assert.equal(columnForItemType("industry_event", "export"), "overseas");
  assert.equal(columnForItemType("explainer", "tech"), "tech");
  assert.equal(columnForItemType("deep_research", "tech"), "research");
});

test("a policy title keeps the document number and does not invent one", () => {
  const notice = policyNotice(
    "关于印发《物流网建设实施方案》的通知(发改经贸〔2026〕1241号)",
    "国家发展改革委 · 通知",
    "2026-08-28T00:00:00.000Z",
  );
  assert.equal(notice.issuer, "国家发展改革委");
  assert.equal(notice.docNo, "发改经贸〔2026〕1241号");
  assert.equal(notice.date, "2026-08-28");
  assert.equal(policyNotice("交通运输部召开例行发布会", "交通运输部 · 交通要闻", null).docNo, null);
  assert.equal(policyNotice("通知", "财政部", "2026-09-20T16:00:00.000Z").date, "2026-09-21");
});

test("the data page is routed, and the retired export feed opens overseas", () => {
  const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  assert.match(read("apps/web/app/routes.ts"), /route\("data", "routes\/data\.tsx"\)/);
  assert.match(read("scripts/smoke.ts"), /\/data/);
  const nav = read("apps/web/app/components/shell/nav.ts");
  const more = read("apps/web/app/routes/more.tsx");
  assert.ok(nav.indexOf('to: "/data"') < nav.indexOf('to: "/research"'));
  assert.ok(more.indexOf('to: "/data"') < more.indexOf('to: "/research"'));
  assert.match(nav, /"\/data"/);
  assert.equal(feedCategory("export"), "overseas");
  assert.equal(feedCategory("overseas"), "overseas");
  assert.equal(feedCategory("not-a-column"), null);
});

test("metric extraction requires a period, a segment, a figure and a unit", () => {
  const points = extractMetricPoints("协会称 2026年8月重卡销量12.3万辆，轻卡销量8万辆。新能源只说了增长。");
  assert.deepEqual(points, [
    { metric: "sales", segment: "重卡", period: "2026-08", value: 12.3, unit: "万辆" },
    { metric: "sales", segment: "轻卡", period: "2026-08", value: 8, unit: "万辆" },
  ]);
  assert.deepEqual(extractMetricPoints("8月重卡市场回暖，同比提升。"), []);
  assert.deepEqual(extractMetricPoints("2026年8月重卡销量同比12.3%。"), []);
});

test("policy lists can require a commercial-vehicle word in the title", () => {
  const source = { config: { ingestNoiseFilter: { requireTitleMatch: ["商用车", "物流"] } } } as never;
  const item = (title: string) => ({ url: "https://example.org/a", title, excerpt: "" }) as never;
  assert.equal(noiseFiltered(item("关于印发《物流网建设实施方案》的通知"), source), false);
  assert.equal(noiseFiltered(item("关于开展全国生态日活动的通知"), source), true);
});

test("a ministry list wrapped as JSON HTML still yields titled notices", () => {
  const html = htmlAtJsonPath(JSON.stringify({
    data: { html: `<ul><li class="cf"><a class="fl" href="/zwgk/zcwj/wjfb/tz/art/2026/art_1.html">关于商用车以旧换新的通知</a><span class="fr">2026-09-30</span></li></ul>` },
  }), "data.html");
  const items = fromHtml(html, "https://www.miit.gov.cn/zwgk/zcwj/wjfb/tz/index.html", {
    config: {
      url: "https://www.miit.gov.cn/api",
      baseUrl: "https://www.miit.gov.cn/zwgk/zcwj/wjfb/tz/index.html",
      itemSelector: "li.cf",
      linkSelector: "a.fl",
      titleSelector: "a.fl",
      publishedAtSelector: "span.fr",
      publishedAtUtcOffset: "+08:00",
      allowUrlPrefixes: ["https://www.miit.gov.cn/zwgk/zcwj/"],
    },
  } as never);
  assert.equal(items.length, 1);
  assert.equal(items[0]!.title, "关于商用车以旧换新的通知");
  assert.equal(items[0]!.url, "https://www.miit.gov.cn/zwgk/zcwj/wjfb/tz/art/2026/art_1.html");
  assert.equal(parseLooseDate("20260921", "+08:00")?.toISOString(), "2026-09-20T16:00:00.000Z");
});
