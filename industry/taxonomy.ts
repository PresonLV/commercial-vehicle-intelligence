// 商用车行业的分类体系：类别、标签词表、公司（主体）名录，以及防止张冠李戴的身份词典。
// 模型按这里的词表打标签，主题页（topics.json）按标签归类，筛选栏按类别分组。
// 类别的 key 会出现在网址里（/all?category=…），上线后就不要再改；标签和名录可以随时增减。

/**
 * 网页上的类别（筛选栏、卡片角标、RSS 分类订阅）。key 是网址和接口里的身份，上线后不要改。
 * section 是日报里的分节标题（几个类别可以共用一节，按这里的顺序排）；guide 告诉模型怎么归类。
 * 没归上类的资料在日报里放进第一个 key 为 industry 的类别所在的节（没有就放最后一节）。
 * 读者能直接看到上游、中游、下游。
 */
export const CATEGORIES = [
  { key: "upstream", label: "上游", section: "上游", guide: "原材料与钢材、轮胎橡胶价格，发动机与动力总成，电驱、动力电池、氢燃料电池，车桥、变速箱、制动、滤清、后处理，润滑油与油液" },
  { key: "oem", label: "中游", section: "中游", guide: "重卡、中轻卡、皮卡、客车、专用车和新能源商用车整车厂的产量、销量、新车型、新平台、价格和产能" },
  { key: "downstream", label: "下游", section: "下游", guide: "经销与流通、后市场配件与服务、物流车队、融资租赁、二手商用车、充换电与加氢、公路运价和货运需求" },
  { key: "policy", label: "政策", section: "政策", guide: "部委、省市主管部门和行业协会发布的政策文件、通知和公告。优先保留文号、发文机关和日期。范围包括以旧换新、报废更新补贴、排放标准、路权、新能源商用车、换电、氢能、治超、高速费和出口管理。乘用车专用政策、与货运无关的政务不要放这里" },
  { key: "data", label: "数据", section: "数据", guide: "已经公布且能核对的产销、上牌和保险数字：内燃机按用途和燃料，商用车按重卡、中卡、轻卡、微卡、客车和新能源，以及终端上牌量、交强险。只有标题、正文没有数字的解读不要放这里" },
  { key: "tech", label: "技术", section: "技术", guide: "换电、氢燃料、自动驾驶、线控底盘、新型动力、车联网、轮胎即服务等新技术和新业态的解释或新品技术发布。把路线讲清楚的说明放这里。新业态可以同时作为主题标签。讲透商业模式的长案例放深度研究" },
  { key: "overseas", label: "海外市场", section: "海外市场", guide: "两件事都放这里。一是海外整车、轮胎、汽配和车队的短做法：按公里付费、轮胎服务合同、翻新、预测性维保、主机厂出勤率服务、配件分销、二手车再营销、租赁与全周期成本，短新闻要能写对国内的启示。二是中国商用车及零部件出口，包括俄罗斯、中亚、中东、非洲、东南亚、拉美的需求、认证、渠道和本地组装。投资者日、年报战略和长案例放深度研究" },
  { key: "research", label: "深度研究", section: "深度研究", guide: "对标公司的长文：投资者日、年报或 10-K 里的战略、业绩会里讲清楚的商业模式、咨询或分析长文、车队和后市场案例。短新闻不要放这里。海外对标看能不能用到国内；国内车队、换电、氢能、自动驾驶干线、车联网和汽配平台看模式要点" },
] as const;

/**
 * 内容理解一步给每篇资料判的“内容类型”（写在 prompts/content-understanding.md 里，改了类型要同步改那份提示词）。
 * 评分提示词（prompts/selection-score.md）按类型给五个维度不同的权重。
 */
export const ITEM_TYPES = ["sales_data", "product_launch", "channel_practice", "market_report", "industry_event", "opinion_analysis", "explainer", "overseas_practice", "deep_research"] as const;

// ── 标签词表 ────────────────────────────────────────────────────────────────────────────

/** 每篇资料的第一个标签必须是这些“分类标签”之一。 */
export const CATEGORY_TAGS = [
  "销量数据", "新车与平台", "零部件", "后市场", "政策法规", "出海", "海外借鉴", "深度研究", "车队物流",
  "观点解读", "数据解读", "技术路线", "现象趋势", "行业动态", "无关噪声", "其他",
] as const;

/** 可选的主题标签。 */
export const TOPIC_TAGS = [
  "新能源", "氢能", "动力总成", "润滑油", "自动驾驶", "换电补能", "价格", "出口市场", "新业态",
] as const;

/** 可选的实体标签（公司、机构）。正文里出现但不在此列的公司，不要写进 tags，主体放 subjects。 */
export const ENTITY_TAGS = [
  "一汽解放", "东风商用车", "中国重汽", "陕汽", "福田", "潍柴", "宇通", "宁德时代", "玉柴", "康明斯", "徐工", "远程",
  "戴姆勒卡车", "沃尔沃集团", "斯堪尼亚", "曼恩", "帕卡", "米其林", "普利司通", "固特异",
  "奥驰", "奥莱利", "前进汽配", "真配件", "LKQ", "FleetPride", "TruckPro", "莱德", "潘世奇", "Knight-Swift", "亨特运输", "老道明", "吉尔泰卡",
  "顺丰", "京东物流", "中通快递", "圆通", "申通", "韵达", "极兔", "德邦", "安能", "壹米滴答", "福佑", "中外运", "长久物流", "满帮", "货拉拉",
  "开思", "途虎", "G7易流", "中交兴路", "智加", "图森", "小马智卡", "启源芯动力", "宏景智驾", "千挂", "中储",
] as const;

/** 模型常写的近义词，统一成词表里的写法。 */
export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  销量: "销量数据", 产销: "销量数据", 市场份额: "销量数据", 市占率: "销量数据",
  新车: "新车与平台", 新平台: "新车与平台", 车型: "新车与平台", 产品: "新车与平台",
  发动机: "零部件", 变速箱: "零部件", 车桥: "零部件", 电池: "零部件", 后处理: "零部件",
  配件: "后市场", 维保: "后市场", 服务: "后市场", 润滑: "润滑油", 机油: "润滑油",
  政策: "政策法规", 监管: "政策法规", 法规: "政策法规", 排放: "政策法规", 补贴: "政策法规",
  出口: "出海", 俄罗斯: "出口市场", 中亚: "出口市场",
  海外做法: "海外借鉴", 按公里付费: "海外借鉴", 翻新胎: "海外借鉴",
  深度: "深度研究", 案例研究: "深度研究",
  汽配连锁: "新业态", 换电运营: "新业态", 数字货运: "新业态", 车队平台: "新业态",
  车队: "车队物流", 物流: "车队物流", 运价: "车队物流", 租赁: "车队物流",
  观点: "观点解读", 评论: "观点解读", 解读: "数据解读", 报告: "数据解读",
  技术: "技术路线", 自动驾驶: "自动驾驶", 无人驾驶: "自动驾驶",
  趋势: "现象趋势", 现象: "现象趋势", 行业: "行业动态", 动态: "行业动态",
  融资: "行业动态", 并购: "行业动态", 收购: "行业动态", 合作: "行业动态",
  新能源: "新能源", 电动: "新能源", 氢能: "氢能", 换电: "换电补能", 价格战: "价格", 降价: "价格",
};

/** 模型漏了分类标签时，按内容类型补一个。 */
export const CATEGORY_BY_ITEM_TYPE: Readonly<Record<string, string>> = {
  sales_data: "销量数据",
  product_launch: "新车与平台",
  channel_practice: "后市场",
  market_report: "数据解读",
  industry_event: "行业动态",
  opinion_analysis: "观点解读",
  explainer: "技术路线",
  overseas_practice: "海外借鉴",
  deep_research: "深度研究",
};

/**
 * 长文走深度研究栏目。短新闻仍用结构化那一步给出的栏目。
 * 内容理解判成 deep_research 时，以这里为准，避免把年报战略留在海外市场或下游。
 */
/** 出海并入海外市场。旧的 export 只作为读旧数据时的别名，不再单独成栏。 */
export function canonicalCategory(category: string | null | undefined): string | null {
  if (!category) return null;
  if (category === "export") return "overseas";
  return category;
}

export function columnForItemType(itemType: string | null | undefined, structureCategory: string | null): string | null {
  if (itemType === "deep_research") return "research";
  return canonicalCategory(structureCategory);
}

/** 深度研究页和主题页要能按公司浏览的对标名单。增删只改这一份，并在 topics.json 里放同 id 的主题。 */
export const TRACKED_COMPANIES: ReadonlyArray<{ id: string; slug: string; group: "benchmark" | "fleet" | "ecosystem" }> = [
  { id: "michelin", slug: "michelin", group: "benchmark" },
  { id: "bridgestone", slug: "bridgestone", group: "benchmark" },
  { id: "goodyear", slug: "goodyear", group: "benchmark" },
  { id: "autozone", slug: "autozone", group: "benchmark" },
  { id: "oreilly", slug: "oreilly", group: "benchmark" },
  { id: "advance-auto", slug: "advance-auto", group: "benchmark" },
  { id: "genuine-parts", slug: "genuine-parts", group: "benchmark" },
  { id: "lkq", slug: "lkq", group: "benchmark" },
  { id: "fleetpride", slug: "fleetpride", group: "benchmark" },
  { id: "truckpro", slug: "truckpro", group: "benchmark" },
  { id: "ryder", slug: "ryder", group: "benchmark" },
  { id: "penske", slug: "penske", group: "benchmark" },
  { id: "knight-swift", slug: "knight-swift", group: "benchmark" },
  { id: "jb-hunt", slug: "jb-hunt", group: "benchmark" },
  { id: "sf-express", slug: "sf-express", group: "fleet" },
  { id: "jdl", slug: "jdl", group: "fleet" },
  { id: "zto-express", slug: "zto-express", group: "fleet" },
  { id: "yto-express", slug: "yto-express", group: "fleet" },
  { id: "sto-express", slug: "sto-express", group: "fleet" },
  { id: "yunda", slug: "yunda", group: "fleet" },
  { id: "jtexpress", slug: "jtexpress", group: "fleet" },
  { id: "debang", slug: "debang", group: "fleet" },
  { id: "ane", slug: "ane", group: "fleet" },
  { id: "yimidida", slug: "yimidida", group: "fleet" },
  { id: "fuyou", slug: "fuyou", group: "fleet" },
  { id: "sinotrans", slug: "sinotrans", group: "fleet" },
  { id: "cjl-logistics", slug: "cjl-logistics", group: "fleet" },
  { id: "full-truck-alliance", slug: "full-truck-alliance", group: "fleet" },
  { id: "lalamove", slug: "lalamove", group: "fleet" },
  { id: "cass-time", slug: "cass-time", group: "ecosystem" },
  { id: "tuhu", slug: "tuhu", group: "ecosystem" },
  { id: "g7", slug: "g7", group: "ecosystem" },
  { id: "sinoiov", slug: "sinoiov", group: "ecosystem" },
  { id: "plus-ai", slug: "plus-ai", group: "ecosystem" },
  { id: "tusimple", slug: "tusimple", group: "ecosystem" },
  { id: "pony", slug: "pony", group: "ecosystem" },
  { id: "qiyuan-power", slug: "qiyuan-power", group: "ecosystem" },
  { id: "hongjing", slug: "hongjing", group: "ecosystem" },
  { id: "qiangua", slug: "qiangua", group: "ecosystem" },
  { id: "girteka", slug: "girteka", group: "benchmark" },
  { id: "old-dominion", slug: "old-dominion", group: "benchmark" },
  { id: "cmst", slug: "cmst", group: "fleet" },
];

// ── 公司与主体 ──────────────────────────────────────────────────────────────────────────

/** 公司主题：id → 显示名、卡片上显示的标签（null 表示只用 entity:<id> 归类）、别名。 */
export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[] }> = {
  "faw-jiefang": { name: "一汽解放", displayTag: "一汽解放", aliases: ["一汽解放", "解放", "Jiefang"] },
  dongfeng: { name: "东风商用车", displayTag: "东风商用车", aliases: ["东风商用车", "东风商用", "东风柳汽"] },
  sinotruk: { name: "中国重汽", displayTag: "中国重汽", aliases: ["中国重汽", "重汽", "汕德卡", "豪沃"] },
  shacman: { name: "陕汽", displayTag: "陕汽", aliases: ["陕汽", "陕西汽车", "德龙"] },
  foton: { name: "福田", displayTag: "福田", aliases: ["福田", "欧曼", "福田戴姆勒"] },
  weichai: { name: "潍柴", displayTag: "潍柴", aliases: ["潍柴", "潍柴动力"] },
  yutong: { name: "宇通", displayTag: "宇通", aliases: ["宇通", "宇通客车"] },
  catl: { name: "宁德时代", displayTag: "宁德时代", aliases: ["宁德时代", "CATL"] },
  yuchai: { name: "玉柴", displayTag: "玉柴", aliases: ["玉柴", "玉柴机器"] },
  cummins: { name: "康明斯", displayTag: "康明斯", aliases: ["康明斯", "Cummins"] },
  xcmg: { name: "徐工", displayTag: "徐工", aliases: ["徐工", "徐工重卡", "徐工汽车"] },
  farizon: { name: "远程", displayTag: "远程", aliases: ["远程", "远程汽车", "吉利远程"] },
  "saic-hongyan": { name: "上汽红岩", displayTag: null, aliases: ["上汽红岩", "红岩"] },
  beiben: { name: "北奔", displayTag: null, aliases: ["北奔", "北奔重汽"] },
  jac: { name: "江淮", displayTag: null, aliases: ["江淮汽车", "江淮重卡"] },
  sany: { name: "三一", displayTag: null, aliases: ["三一重卡", "三一汽车"] },
  "king-long": { name: "金龙", displayTag: null, aliases: ["金龙客车", "厦门金龙"] },
  zhongtong: { name: "中通客车", displayTag: null, aliases: ["中通客车"] },
  "daimler-truck": { name: "戴姆勒卡车", displayTag: "戴姆勒卡车", aliases: ["戴姆勒卡车", "Daimler Truck", "奔驰卡车"] },
  "volvo-group": { name: "沃尔沃集团", displayTag: "沃尔沃集团", aliases: ["沃尔沃集团", "沃尔沃卡车", "Volvo Group", "Volvo Trucks"] },
  traton: { name: "传拓", displayTag: null, aliases: ["传拓", "TRATON"] },
  scania: { name: "斯堪尼亚", displayTag: "斯堪尼亚", aliases: ["斯堪尼亚", "Scania"] },
  "man-truck": { name: "曼恩", displayTag: "曼恩", aliases: ["曼恩", "MAN Truck"] },
  paccar: { name: "帕卡", displayTag: "帕卡", aliases: ["帕卡", "PACCAR", "彼得比尔特", "肯沃斯"] },
  michelin: { name: "米其林", displayTag: "米其林", aliases: ["米其林", "Michelin"] },
  bridgestone: { name: "普利司通", displayTag: "普利司通", aliases: ["普利司通", "Bridgestone"] },
  goodyear: { name: "固特异", displayTag: "固特异", aliases: ["固特异", "Goodyear"] },
  autozone: { name: "奥驰", displayTag: "奥驰", aliases: ["奥驰", "AutoZone"] },
  oreilly: { name: "奥莱利", displayTag: "奥莱利", aliases: ["奥莱利", "O'Reilly"] },
  "advance-auto": { name: "前进汽配", displayTag: "前进汽配", aliases: ["前进汽配", "Advance Auto Parts"] },
  "genuine-parts": { name: "真配件", displayTag: "真配件", aliases: ["真配件", "Genuine Parts", "NAPA"] },
  lkq: { name: "LKQ", displayTag: "LKQ", aliases: ["LKQ"] },
  fleetpride: { name: "FleetPride", displayTag: "FleetPride", aliases: ["FleetPride"] },
  truckpro: { name: "TruckPro", displayTag: "TruckPro", aliases: ["TruckPro"] },
  ryder: { name: "莱德", displayTag: "莱德", aliases: ["莱德", "Ryder"] },
  penske: { name: "潘世奇", displayTag: "潘世奇", aliases: ["潘世奇", "Penske"] },
  "knight-swift": { name: "Knight-Swift", displayTag: "Knight-Swift", aliases: ["Knight-Swift"] },
  "jb-hunt": { name: "亨特运输", displayTag: "亨特运输", aliases: ["亨特运输", "J.B. Hunt"] },
  girteka: { name: "吉尔泰卡", displayTag: "吉尔泰卡", aliases: ["吉尔泰卡", "Girteka"] },
  "old-dominion": { name: "老道明", displayTag: "老道明", aliases: ["老道明", "Old Dominion"] },
  "sf-express": { name: "顺丰", displayTag: "顺丰", aliases: ["顺丰", "顺丰控股"] },
  jdl: { name: "京东物流", displayTag: "京东物流", aliases: ["京东物流", "JD Logistics"] },
  "zto-express": { name: "中通快递", displayTag: "中通快递", aliases: ["中通快递", "ZTO Express"] },
  "yto-express": { name: "圆通", displayTag: "圆通", aliases: ["圆通", "圆通速递"] },
  "sto-express": { name: "申通", displayTag: "申通", aliases: ["申通", "申通快递"] },
  yunda: { name: "韵达", displayTag: "韵达", aliases: ["韵达", "韵达股份"] },
  jtexpress: { name: "极兔", displayTag: "极兔", aliases: ["极兔", "极兔速递"] },
  debang: { name: "德邦", displayTag: "德邦", aliases: ["德邦", "德邦股份"] },
  ane: { name: "安能", displayTag: "安能", aliases: ["安能", "安能物流"] },
  yimidida: { name: "壹米滴答", displayTag: "壹米滴答", aliases: ["壹米滴答"] },
  fuyou: { name: "福佑", displayTag: "福佑", aliases: ["福佑", "福佑卡车"] },
  sinotrans: { name: "中外运", displayTag: "中外运", aliases: ["中外运", "中国外运", "Sinotrans"] },
  "cjl-logistics": { name: "长久物流", displayTag: "长久物流", aliases: ["长久物流"] },
  "full-truck-alliance": { name: "满帮", displayTag: "满帮", aliases: ["满帮", "运满满", "货车帮"] },
  lalamove: { name: "货拉拉", displayTag: "货拉拉", aliases: ["货拉拉", "Lalamove"] },
  cmst: { name: "中储", displayTag: "中储", aliases: ["中储股份", "中国物资储运"] },
  "cass-time": { name: "开思", displayTag: "开思", aliases: ["开思"] },
  tuhu: { name: "途虎", displayTag: "途虎", aliases: ["途虎", "途虎养车"] },
  g7: { name: "G7易流", displayTag: "G7易流", aliases: ["G7易流"] },
  sinoiov: { name: "中交兴路", displayTag: "中交兴路", aliases: ["中交兴路"] },
  "plus-ai": { name: "智加", displayTag: "智加", aliases: ["智加", "PlusAI"] },
  tusimple: { name: "图森", displayTag: "图森", aliases: ["图森", "图森未来", "TuSimple"] },
  pony: { name: "小马智卡", displayTag: "小马智卡", aliases: ["小马智卡", "小马智行"] },
  "qiyuan-power": { name: "启源芯动力", displayTag: "启源芯动力", aliases: ["启源芯动力"] },
  hongjing: { name: "宏景智驾", displayTag: "宏景智驾", aliases: ["宏景智驾"] },
  qiangua: { name: "千挂", displayTag: "千挂", aliases: ["千挂", "千挂科技"] },
};

/**
 * 身份词典：摘要和标题里出现的公司，必须在原文里也出现过，否则退回原标题、丢掉摘要（防止模型张冠李戴）。
 * 模式尽量避开过宽的单字（例如单独的“解放”“东风”“福田”）。
 */
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "faw-jiefang", name: "一汽解放", patterns: [/一汽解放|解放(?:J|JH|虎)|faw[\s-]?jiefang|\bjiefang\b/i] },
  { id: "dongfeng", name: "东风商用车", patterns: [/东风商用车|东风商用|东风柳汽|东风天龙|东风天锦|东风凯普特|东风华神|\bdfcv\b/i] },
  { id: "sinotruk", name: "中国重汽", patterns: [/中国重汽|重汽|汕德卡|豪沃|sinotruk|\bcnhtc\b/i] },
  { id: "shacman", name: "陕汽", patterns: [/陕汽|陕西重汽|德龙X|shacman/i] },
  { id: "foton", name: "福田", patterns: [/福田汽车|福田戴姆勒|欧曼|奥铃|\bfoton\b/i] },
  { id: "weichai", name: "潍柴", patterns: [/潍柴|weichai/i] },
  { id: "yutong", name: "宇通", patterns: [/宇通|yutong/i] },
  { id: "catl", name: "宁德时代", patterns: [/宁德时代|\bcatl\b/i] },
  { id: "yuchai", name: "玉柴", patterns: [/玉柴|yuchai/i] },
  { id: "cummins", name: "康明斯", patterns: [/康明斯|cummins/i] },
  { id: "xcmg", name: "徐工", patterns: [/徐工|\bxcmg\b/i] },
  { id: "farizon", name: "远程", patterns: [/远程(?:汽车|商用|新能源)|吉利远程|farizon/i] },
  { id: "saic-hongyan", name: "上汽红岩", patterns: [/上汽红岩|红岩杰狮|hongyan/i] },
  { id: "beiben", name: "北奔", patterns: [/北奔重汽|北奔/i] },
  { id: "jac", name: "江淮", patterns: [/江淮汽车|江淮重卡|帅铃/i] },
  { id: "sany", name: "三一", patterns: [/三一重卡|三一汽车|sany\s*(?:truck|group)/i] },
  { id: "king-long", name: "金龙", patterns: [/金龙客车|厦门金龙|king\s*long/i] },
  { id: "zhongtong", name: "中通客车", patterns: [/中通客车/] },
  { id: "daimler-truck", name: "戴姆勒卡车", patterns: [/戴姆勒卡车|奔驰卡车|daimler\s*truck|mercedes-benz\s*trucks/i] },
  { id: "volvo-group", name: "沃尔沃集团", patterns: [/沃尔沃(?:集团|卡车)|volvo\s*(?:group|trucks)/i] },
  { id: "traton", name: "传拓", patterns: [/传拓|\btraton\b/i] },
  { id: "scania", name: "斯堪尼亚", patterns: [/斯堪尼亚|\bscania\b/i] },
  { id: "man-truck", name: "曼恩", patterns: [/曼恩|MAN\s+Truck/] },
  { id: "paccar", name: "帕卡", patterns: [/帕卡|\bpaccar\b|peterbilt|kenworth/i] },
  { id: "michelin", name: "米其林", patterns: [/米其林|\bmichelin\b/i] },
  { id: "bridgestone", name: "普利司通", patterns: [/普利司通|\bbridgestone\b/i] },
  { id: "goodyear", name: "固特异", patterns: [/固特异|\bgoodyear\b/i] },
  { id: "autozone", name: "奥驰", patterns: [/奥驰|AutoZone/i] },
  { id: "oreilly", name: "奥莱利", patterns: [/奥莱利|O['’]Reilly Auto/i] },
  { id: "advance-auto", name: "前进汽配", patterns: [/前进汽配|Advance Auto Parts/i] },
  { id: "genuine-parts", name: "真配件", patterns: [/真配件|Genuine Parts|\bNAPA\b/i] },
  { id: "lkq", name: "LKQ", patterns: [/\bLKQ\b/] },
  { id: "fleetpride", name: "FleetPride", patterns: [/FleetPride/i] },
  { id: "truckpro", name: "TruckPro", patterns: [/TruckPro/i] },
  { id: "ryder", name: "莱德", patterns: [/莱德|\bRyder\b/i] },
  { id: "penske", name: "潘世奇", patterns: [/潘世奇|\bPenske\b/i] },
  { id: "knight-swift", name: "Knight-Swift", patterns: [/Knight-Swift|Knight Swift/i] },
  { id: "jb-hunt", name: "亨特运输", patterns: [/亨特运输|J\.?\s*B\.?\s*Hunt/i] },
  { id: "girteka", name: "吉尔泰卡", patterns: [/吉尔泰卡|\bGirteka\b/i] },
  { id: "old-dominion", name: "老道明", patterns: [/老道明|Old Dominion/i] },
  { id: "sf-express", name: "顺丰", patterns: [/顺丰/] },
  { id: "jdl", name: "京东物流", patterns: [/京东物流|JD Logistics/i] },
  { id: "zto-express", name: "中通快递", patterns: [/中通快递|ZTO Express/i] },
  { id: "yto-express", name: "圆通", patterns: [/圆通/] },
  { id: "sto-express", name: "申通", patterns: [/申通/] },
  { id: "yunda", name: "韵达", patterns: [/韵达/] },
  { id: "jtexpress", name: "极兔", patterns: [/极兔/] },
  { id: "debang", name: "德邦", patterns: [/德邦/] },
  { id: "ane", name: "安能", patterns: [/安能物流|安能快运|安能/] },
  { id: "yimidida", name: "壹米滴答", patterns: [/壹米滴答/] },
  { id: "fuyou", name: "福佑", patterns: [/福佑卡车|福佑/] },
  { id: "sinotrans", name: "中外运", patterns: [/中国外运|中外运|Sinotrans/i] },
  { id: "cjl-logistics", name: "长久物流", patterns: [/长久物流/] },
  { id: "full-truck-alliance", name: "满帮", patterns: [/满帮|运满满|货车帮|Full Truck Alliance/i] },
  { id: "lalamove", name: "货拉拉", patterns: [/货拉拉|Lalamove/i] },
  { id: "cmst", name: "中储", patterns: [/中储股份|中国物资储运|中储智运/] },
  { id: "cass-time", name: "开思", patterns: [/开思|CassTime/i] },
  { id: "tuhu", name: "途虎", patterns: [/途虎养车|途虎/] },
  { id: "g7", name: "G7易流", patterns: [/G7易流/] },
  { id: "sinoiov", name: "中交兴路", patterns: [/中交兴路/] },
  { id: "plus-ai", name: "智加", patterns: [/智加科技|\bPlusAI\b|Plus\.ai/i] },
  { id: "tusimple", name: "图森", patterns: [/图森未来|图森|TuSimple/i] },
  { id: "pony", name: "小马智卡", patterns: [/小马智卡|小马智行|Pony\.ai/i] },
  { id: "qiyuan-power", name: "启源芯动力", patterns: [/启源芯动力/] },
  { id: "hongjing", name: "宏景智驾", patterns: [/宏景智驾/] },
  { id: "qiangua", name: "千挂", patterns: [/千挂科技|千挂/] },
];

/** 这些域名上的文章，发布方就是对应的公司（行业媒体不算）。 */
export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "weichai", domains: ["weichai.com"] },
  { entityId: "catl", domains: ["catl.com"] },
  { entityId: "yutong", domains: ["yutong.com", "yutong.com.cn"] },
  { entityId: "foton", domains: ["foton.com.cn"] },
  { entityId: "shacman", domains: ["sxqc.com"] },
  { entityId: "dongfeng", domains: ["dfcv.com.cn"] },
  { entityId: "cummins", domains: ["cummins.com", "cummins.com.cn"] },
  { entityId: "xcmg", domains: ["xcmg.com"] },
  { entityId: "daimler-truck", domains: ["daimlertruck.com"] },
  { entityId: "volvo-group", domains: ["volvogroup.com"] },
  { entityId: "scania", domains: ["scania.com"] },
  { entityId: "man-truck", domains: ["mantruckandbus.com"] },
  { entityId: "traton", domains: ["traton.com"] },
  { entityId: "paccar", domains: ["paccar.com"] },
  { entityId: "oreilly", domains: ["oreillyauto.com"] },
  { entityId: "ryder", domains: ["ryder.com"] },
  { entityId: "jb-hunt", domains: ["jbhunt.com"] },
  { entityId: "girteka", domains: ["girteka.eu"] },
  { entityId: "old-dominion", domains: ["odfl.com"] },
  { entityId: "g7", domains: ["g7.com.cn"] },
  { entityId: "sinoiov", domains: ["sinoiov.com"] },
  { entityId: "plus-ai", domains: ["plus.ai"] },
];

/** 原文里的这些写法也算提到了对应公司。 */
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [
  { entityId: "sinotruk", pattern: /SITRAK/i },
  { entityId: "faw-jiefang", pattern: /FAW\s+Jiefang/i },
];
