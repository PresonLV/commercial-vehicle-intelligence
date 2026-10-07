// The deep-research column is a content type, not a rename of an existing category key.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { CATEGORIES, columnForItemType, ENTITIES, TOPIC_TAGS, TRACKED_COMPANIES } from "@aihot/industry/taxonomy";
import { finalizeCopy, keepsResearchShape } from "@aihot/backend/editorial/writing";

test("deep research forces the research column and tracked companies have topics", () => {
  const keys = CATEGORIES.map((c) => c.key);
  assert.deepEqual(keys, ["upstream", "oem", "downstream", "policy", "data", "tech", "overseas", "research"]);
  assert.equal(keys.at(-1), "research");
  assert.equal(keys[keys.indexOf("overseas") + 1], "research");
  assert.equal(columnForItemType("deep_research", "overseas"), "research");
  assert.equal(columnForItemType("deep_research", "downstream"), "research");
  assert.equal(columnForItemType("overseas_practice", "overseas"), "overseas");
  assert.equal(columnForItemType("industry_event", "export"), "overseas");
  assert.equal(columnForItemType("explainer", "tech"), "tech");
  assert.equal(columnForItemType("industry_event", "downstream"), "downstream");
  assert.ok((TOPIC_TAGS as readonly string[]).includes("新业态"));
  const topics = JSON.parse(readFileSync(new URL("../industry/topics.json", import.meta.url), "utf8")) as { topics: Array<{ slug: string }> };
  const slugs = new Set(topics.topics.map((t) => t.slug));
  assert.ok(slugs.has("new-ecosystem"));
  for (const company of TRACKED_COMPANIES) {
    assert.ok(ENTITIES[company.id], company.id);
    assert.equal(company.id, company.slug);
    assert.ok(slugs.has(company.slug), company.slug);
  }
});

test("a four-part case is not compacted into a short lead", () => {
  const summary = [
    "业务模式概述：这家车队把轮胎从一次性采购改成按公里收费，合同里包含巡检、应急换胎和翻新，车队不再自己管库存。",
    "关键数据与做法：原文写了合同年限、单公里价格和枢纽仓的配送时效，门店按枢纽辐射把轮胎送到干线停车场。",
    "竞争与风险：独立维修店仍用一次性采购，价格敏感和翻新胎接受度会拖慢切换，短合同也难以摊薄巡检成本。",
    "对国内的启示：国内车队更分散，个体司机多，先从干线合同客户试点，不要假设所有人接受翻新胎和按公里付费。",
  ].join("\n");
  assert.equal(keepsResearchShape(summary), true);
  const copy = finalizeCopy(
    { title: "fleet tire contract", text: "A fleet signed a pay-per-mile tire contract with retread and hub delivery.", sourceKind: "rss" },
    { titleZh: "车队轮胎改成按公里收费", summaryZh: summary },
  );
  assert.ok(copy.summaryZh.includes("业务模式概述："));
  assert.ok(copy.summaryZh.includes("对国内的启示："));
  assert.ok(copy.summaryZh.length > 190);
});
