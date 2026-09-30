// The deep-research column is a content type, not a rename of an existing category key.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { CATEGORIES, columnForItemType, ENTITIES, TOPIC_TAGS, TRACKED_COMPANIES } from "@aihot/industry/taxonomy";
import { finalizeCopy, keepsResearchShape } from "@aihot/backend/editorial/writing";

test("deep research forces the research column and tracked companies have topics", () => {
  const keys = CATEGORIES.map((c) => c.key);
  assert.equal(keys[keys.indexOf("overseas") + 1], "research");
  assert.equal(columnForItemType("deep_research", "overseas"), "research");
  assert.equal(columnForItemType("deep_research", "downstream"), "research");
  assert.equal(columnForItemType("overseas_practice", "overseas"), "overseas");
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
    "业务模式概述：这家车队把轮胎改成按公里收费，合同里包含巡检和翻新。",
    "关键数据与做法：原文写了合同年限和单公里价格，门店按枢纽辐射配送。",
    "竞争与风险：独立维修店仍用一次性采购，价格敏感会拖慢切换。",
    "对国内的启示：国内车队更分散，先从干线合同客户试点，不要假设个体司机接受翻新胎。",
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
