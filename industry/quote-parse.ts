// Truck guide prices copied off a product page. Editorial paragraphs are not kept.

export type QuoteKind = "msrp" | "dealer";
export type QuoteConfidence = "high" | "review";

export interface ParsedModel {
  modelName: string;
  brand: string;
  series: string;
  segment: string;
  drive: string;
  engineBrand: string;
  horsepower: number | null;
  gearbox: string;
  powerType: string;
  emission: string;
  msrpWan: number | null;
  msrpLiteral: string;
  dealerWan: number | null;
  dealerLiteral: string;
  /** high only when the price node itself says 万元. A bare number stays review. */
  confidence: QuoteConfidence | "none";
  excerpt: string;
}

export interface ListedPrice {
  url: string;
  name: string;
  priceText: string;
}

const BRAND_RULES: Array<[RegExp, string]> = [
  [/一汽解放|解放/, "一汽解放"],
  [/东风天龙|东风天锦|东风商用车|天龙/, "东风商用车"],
  [/江铃/, "江铃"],
  [/汕德卡|豪沃|HOWO|中国重汽|重汽/, "中国重汽"],
  [/陕汽|德龙/, "陕汽"],
  [/欧曼|奥铃|福田/, "福田"],
  [/格尔发|帅铃|江淮/, "江淮"],
  [/大运/, "大运"],
  [/北奔/, "北奔"],
  [/红岩|杰狮/, "上汽红岩"],
  [/三一/, "三一"],
  [/徐工|漢風|汉风/, "徐工"],
  [/奔驰|Actros/i, "奔驰"],
  [/沃尔沃|Volvo/i, "沃尔沃"],
  [/斯堪尼亚|Scania/i, "斯堪尼亚"],
];

const SERIES_RULES: Array<[RegExp, string]> = [
  [/天龙旗舰|旗舰GX|旗舰KX/, "天龙旗舰"],
  [/天龙KL/, "天龙KL"],
  [/汕德卡(?:\s|SITRAK)*C7H|C7H/, "汕德卡C7H"],
  [/HOWO[\s-]*T7H|豪沃T7H|TH7/, "豪沃T7H"],
  [/HOWO[\s-]*TX(?![0-9])|豪沃TX/, "豪沃TX"],
  [/X6000/, "X6000"],
  [/X5000/, "X5000"],
  [/M3000S/, "M3000S"],
  [/M3000/, "M3000"],
  [/欧曼银河|银河/, "欧曼银河"],
  [/欧曼EST|EST-A/, "欧曼EST"],
  [/奥铃/, "奥铃"],
  [/格尔发/, "格尔发"],
  [/帅铃/, "帅铃"],
  [/威龙/, "威龙"],
  [/杰狮/, "杰狮"],
  [/漢風|汉风/, "漢風"],
  [/三一重卡|三一集团/, "三一重卡"],
  [/Actros/i, "Actros"],
  [/FH16|(?:沃尔沃)?FH(?![A-Z])/, "FH"],
  [/J6P/, "J6P"],
  [/JH6/, "JH6"],
  [/虎6/, "虎6"],
  [/虎V/, "虎V"],
  [/J7/, "J7"],
  [/V9(?![0-9])/, "V9"],
  [/V3(?![0-9A-Z])/, "V3"],
];

/** Announcement codes such as ZZ4257V384 sit in parentheses and are not the series name. */
function seriesText(name: string): string {
  return name.replace(/[（(][^()（）]*[)）]/g, " ");
}

function decode(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function labeled(html: string, label: string): string {
  const li = new RegExp(`<li>\\s*<span>\\s*${label}：\\s*</span>\\s*([^<]*)</li>`, "i").exec(html);
  if (li) return decode(li[1] ?? "");
  const cell = new RegExp(`<td>\\s*${label}：\\s*</td>\\s*<td>([^<]*)</td>`, "i").exec(html);
  return cell ? decode(cell[1] ?? "") : "";
}

function usable(value: string): string {
  const text = value.trim();
  if (!text || text === "暂无" || text === "--" || text === "—") return "";
  return text;
}

export function brandOf(name: string): string {
  for (const [pattern, brand] of BRAND_RULES) if (pattern.test(name)) return brand;
  return "";
}

export function seriesOf(name: string): string {
  const text = seriesText(name);
  for (const [pattern, series] of SERIES_RULES) if (pattern.test(text)) return series;
  return "";
}

export function powerOf(fuel: string, name: string): string {
  const text = `${fuel} ${name}`;
  if (/换电/.test(text)) return "换电";
  if (/氢|燃料电池/.test(text)) return "氢燃料";
  if (/纯电|电动/.test(text) && !/混/.test(text)) return "纯电";
  if (/LNG|液化天然气/.test(text)) return "LNG";
  if (/CNG|压缩天然气/.test(text)) return "CNG";
  if (/柴油/.test(text)) return "柴油";
  if (/天然气/.test(text)) return "天然气";
  return "";
}

export function segmentOf(name: string, tonnage: string): string {
  const body = /自卸/.test(name) ? "自卸车" : /载货/.test(name) ? "载货车" : /牵引/.test(name) ? "牵引车" : "";
  const ton = /轻卡/.test(tonnage) || /轻卡/.test(name) ? "轻卡" : /中卡/.test(tonnage) || /中卡/.test(name) ? "中卡" : /重卡/.test(tonnage) || /重卡/.test(name) ? "重卡" : "";
  if (ton === "轻卡") return "轻卡";
  if (ton === "中卡") return body ? `中卡${body}` : "中卡";
  if (ton === "重卡" && body) return `重卡${body}`;
  if (body === "牵引车" || body === "自卸车" || body === "载货车") return body;
  return ton;
}

function emissionOf(raw: string): string {
  const text = usable(raw);
  const hit = /国六|国五|国四|欧六|欧五/.exec(text);
  return hit?.[0] ?? "";
}

function horsepowerOf(field: string, name: string): number | null {
  const fromField = /(\d+(?:\.\d+)?)\s*马力/.exec(usable(field));
  if (fromField) return Number(fromField[1]);
  const fromName = /(\d+(?:\.\d+)?)\s*马力/.exec(name);
  return fromName ? Number(fromName[1]) : null;
}

/** A single config price. A range such as 41-59万元 is not one truck. */
export function readConfigPrice(raw: string): { wan: number | null; level: QuoteConfidence | "none"; literal: string } {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text || /暂无|咨询本地|询底价/.test(text)) return { wan: null, level: "none", literal: "" };
  if (/\d+(?:\.\d+)?\s*[-~～至]\s*\d+(?:\.\d+)?/.test(text)) return { wan: null, level: "none", literal: "" };
  const withUnit = /^(\d+(?:\.\d+)?)\s*万元$/.exec(text);
  if (withUnit) return { wan: Number(withUnit[1]), level: "high", literal: text };
  const bare = /^(\d+(?:\.\d+)?)$/.exec(text);
  if (bare) return { wan: Number(bare[1]), level: "review", literal: text };
  return { wan: null, level: "none", literal: "" };
}

function excerptFor(model: Omit<ParsedModel, "excerpt" | "confidence">, kind: QuoteKind): string {
  const price = kind === "msrp" ? model.msrpLiteral : model.dealerLiteral;
  const label = kind === "msrp" ? "厂商指导价" : "经销商报价";
  const parts = [`${model.modelName}；${label}：${price}`];
  if (model.drive) parts.push(`驱动形式：${model.drive}`);
  if (model.engineBrand) parts.push(`发动机品牌：${model.engineBrand}`);
  if (model.horsepower != null) parts.push(`最大马力：${model.horsepower}马力`);
  if (model.gearbox) parts.push(`变速箱：${model.gearbox}`);
  if (model.powerType) parts.push(`燃料：${model.powerType}`);
  if (model.emission) parts.push(`排放标准：${model.emission}`);
  return parts.join("；");
}

/** One 卡车网 product page. Returns null when the page has no config name. */
export function parseChinatruckProduct(html: string): ParsedModel | null {
  const nameNode = /<div class="car-name[^"]*">([^<]+)<\/div>/.exec(html);
  const modelName = decode(nameNode?.[1] ?? "");
  if (!modelName) return null;
  const guide = /<p>\s*厂商指导价：\s*<span>([^<]*)<\/span>\s*<\/p>/.exec(html);
  const dealerNode = /<p>\s*经销商报价：\s*<span>([^<]*)<\/span>\s*<\/p>/.exec(html);
  const msrp = readConfigPrice(decode(guide?.[1] ?? ""));
  const dealer = readConfigPrice(decode(dealerNode?.[1] ?? ""));
  const fuel = usable(labeled(html, "燃料类型")) || usable(labeled(html, "燃料种类"));
  const parsed: Omit<ParsedModel, "excerpt" | "confidence"> = {
    modelName,
    brand: brandOf(modelName),
    series: seriesOf(modelName),
    segment: segmentOf(modelName, labeled(html, "吨位级别")),
    drive: usable(labeled(html, "驱动形式")),
    engineBrand: usable(labeled(html, "发动机品牌")),
    horsepower: horsepowerOf(labeled(html, "最大马力"), modelName),
    gearbox: usable(labeled(html, "变速箱型号")) || usable(labeled(html, "变速箱")),
    powerType: powerOf(fuel, modelName),
    emission: emissionOf(labeled(html, "排放标准")),
    msrpWan: msrp.wan,
    msrpLiteral: msrp.literal,
    dealerWan: dealer.wan,
    dealerLiteral: dealer.literal,
  };
  const level = msrp.level === "high" || dealer.level === "high" ? "high" : msrp.level === "review" || dealer.level === "review" ? "review" : "none";
  const confidence: ParsedModel["confidence"] = parsed.brand && parsed.segment && level === "high" ? "high" : level === "none" ? "none" : "review";
  const excerpt = msrp.level !== "none" ? excerptFor(parsed, "msrp") : dealer.level !== "none" ? excerptFor(parsed, "dealer") : "";
  return { ...parsed, confidence, excerpt };
}

/** Series table. A numeric price is worth opening; 暂无 is not a price. */
export function parseChinatruckList(html: string): ListedPrice[] {
  const rows: ListedPrice[] = [];
  for (const match of html.matchAll(/<tr class="tbody">([\s\S]*?)<\/tr>/g)) {
    const block = match[1] ?? "";
    const link = /href="(https:\/\/www\.chinatruck\.org\/product\/truck\/\d+\.html)"[^>]*title="([^"]*)"/.exec(block);
    const price = /<span class="price">([^<]*)<\/span>/.exec(block);
    if (!link || !price) continue;
    rows.push({ url: link[1]!, name: decode(link[2] ?? ""), priceText: decode(price[1] ?? "") });
  }
  return rows;
}

export function listPriceWorthOpening(priceText: string): boolean {
  return readConfigPrice(priceText).level !== "none" || /^\d+(?:\.\d+)?$/.test(priceText.trim());
}
