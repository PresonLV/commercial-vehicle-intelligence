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
  { key: "overseas", label: "海外市场", section: "海外市场", guide: "海外整车、轮胎和车队的商业模式与做法：按公里付费、轮胎服务合同、翻新、预测性维保、主机厂出勤率服务、配件分销和经销商模式、二手车再营销、租赁与全周期成本、润滑油车队项目。看的是能不能借鉴到国内，不是海外本地花絮，也不是中国车出口本身" },
  { key: "policy", label: "政策", section: "政策与数据", guide: "排放标准、新能源补贴、以旧换新和报废更新、工信部车辆公告、道路货运规则和其他监管变化" },
  { key: "data", label: "数据", section: "政策与数据", guide: "中汽协等机构的月度产销、市场份额、出口量和能改变判断的行业统计" },
  { key: "export", label: "出海", section: "出海与技术", guide: "商用车及零部件出口，俄罗斯、中亚、中东、非洲、东南亚、拉美等海外市场的需求、认证、渠道和本地组装" },
  { key: "tech", label: "技术", section: "出海与技术", guide: "自动驾驶卡车、智能网联、线控底盘，以及会改变产品路线的动力和补能技术节点" },
] as const;

/**
 * 内容理解一步给每篇资料判的“内容类型”（写在 prompts/content-understanding.md 里，改了类型要同步改那份提示词）。
 * 评分提示词（prompts/selection-score.md）按类型给五个维度不同的权重。
 */
export const ITEM_TYPES = ["sales_data", "product_launch", "channel_practice", "market_report", "industry_event", "opinion_analysis", "explainer", "overseas_practice"] as const;

// ── 标签词表 ────────────────────────────────────────────────────────────────────────────

/** 每篇资料的第一个标签必须是这些“分类标签”之一。 */
export const CATEGORY_TAGS = [
  "销量数据", "新车与平台", "零部件", "后市场", "政策法规", "出海", "海外借鉴", "车队物流",
  "观点解读", "数据解读", "技术路线", "现象趋势", "行业动态", "无关噪声", "其他",
] as const;

/** 可选的主题标签。 */
export const TOPIC_TAGS = [
  "新能源", "氢能", "动力总成", "润滑油", "自动驾驶", "换电补能", "价格", "出口市场",
] as const;

/** 可选的实体标签（公司、机构）。正文里出现但不在此列的公司，不要写进 tags，主体放 subjects。 */
export const ENTITY_TAGS = [
  "一汽解放", "东风商用车", "中国重汽", "陕汽", "福田", "潍柴", "宇通", "宁德时代", "玉柴", "康明斯", "徐工", "远程",
  "戴姆勒卡车", "沃尔沃集团", "斯堪尼亚", "曼恩", "帕卡", "米其林", "普利司通", "固特异",
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
};

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
];

/** 原文里的这些写法也算提到了对应公司。 */
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [
  { entityId: "sinotruk", pattern: /SITRAK/i },
  { entityId: "faw-jiefang", pattern: /FAW\s+Jiefang/i },
];
