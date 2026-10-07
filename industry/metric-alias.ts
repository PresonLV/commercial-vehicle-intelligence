// Exact names that are the same company in different write-ups. The stored brand is the
// canonical name; brand_text keeps the wording on the page. Substring matches are not used,
// so 东风汽车股份 stays apart from 东风商用车, and 福田康明斯 stays apart from 福田 and 康明斯.
const ALIASES: Record<string, string> = {
  解放: "一汽解放",
  一汽解放: "一汽解放",
  解放汽车: "一汽解放",
  重汽: "中国重汽",
  中国重汽: "中国重汽",
  中国重汽集团: "中国重汽",
  陕汽: "陕汽",
  陕汽集团: "陕汽",
  陕西汽车: "陕汽",
  福田: "福田",
  福田汽车: "福田",
  北汽福田: "福田",
  东风: "东风商用车",
  东风汽车: "东风商用车",
  东风商用车: "东风商用车",
  江淮: "江淮",
  江淮汽车: "江淮",
  徐工: "徐工",
  徐工汽车: "徐工",
  北汽: "北汽重卡",
  北汽重卡: "北汽重卡",
  云内: "云内动力",
  云内动力: "云内动力",
  全柴: "全柴",
  安徽全柴: "全柴",
  上柴: "上柴",
  上柴股份: "上柴",
  宇通: "宇通",
  宇通客车: "宇通",
  金龙: "金龙",
  金龙汽车: "金龙",
  厦门金龙: "金龙",
  中通: "中通客车",
  中通客车: "中通客车",
  江铃: "江铃",
  江铃汽车: "江铃",
  潍柴: "潍柴",
  潍柴动力: "潍柴",
  玉柴: "玉柴",
  玉柴机器: "玉柴",
  玉柴股份: "玉柴",
  康明斯: "康明斯",
};

export function canonicalBrand(name: string): string {
  const text = name.trim();
  if (!text) return "";
  return ALIASES[text] ?? text;
}
