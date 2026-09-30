// 站点身份和读者看得到的文案。换成你的行业时，先改这个文件。
// 网页和后端都读它；改完重新构建（docker compose up --build）即可生效。
// 域名不在这里：部署时用环境变量 SITE_URL 设置。

export const SITE = {
  /** 站名：导航、页面标题、分享图、RSS、MCP、后台都用它。 */
  name: "商车热榜",
  /**
   * 行业词：拼进默认说法里，比如“商用车日报”“商用车动态”。
   * 中文行业词和后面的名词之间不加空格。
   */
  subject: "商用车",
  /** 首页的完整标题（浏览器标签、搜索结果）。 */
  homeTitle: "商车热榜 — 商用车行业动态 · 每日精选与日报",
  /** 一句话介绍：搜索引擎、分享卡片、RSS、llms.txt 会用。 */
  description: "盯住商用车上游、中游、下游、政策、数据、技术和海外市场的公开信源，筛出销量、政策文件、整车、后市场、出口、国内车队和新业态技术，以及海外可借鉴的车队和轮胎做法，把同一件事归到一起，每天早上出一份日报。",
  /** 首页左上角和侧边栏下面的一行小字。 */
  tagline: "上游、中游、下游、海外市场和深度研究，每天值得看的几条",
  /** 界面语言（HTML lang、og:locale）。 */
  locale: "zh-CN",
  /** 默认域名，只在没设置 SITE_URL 时使用。 */
  defaultUrl: "http://localhost:3000",
  /**
   * MCP 工具名的前缀（小写字母、数字、下划线），工具会叫 cvhot_get_latest、cvhot_search……
   * 已经有人接入后就不要再改。
   */
  mcpPrefix: "cvhot",
  /** 对外联系邮箱（选填）：使用规则、llms.txt、响应头里会写。 */
  contactEmail: null as string | null,
  /** 页脚的一行小字（选填）。 */
  footerNote: "公开信息的摘要索引，原文版权归各来源所有",
  /** 中国大陆网站的 ICP 备案号（选填），填了就显示在页脚并链接到工信部备案系统。 */
  icp: null as string | null,
  /** 结构化数据里的网站运营者（搜索引擎用）。 */
  organization: {
    name: "商车热榜",
    /** 创始人（选填）：{ name, url, description }。 */
    founder: null as null | { name: string; url?: string; description?: string },
  },
  /** 抓取信源时报上的名字（User-Agent 里用），不要冒用别的站。 */
  crawlerName: "ShangcheBot",
} as const;

/** 关于页的文案。数字（信源数、收录数、精选数、日报期数）来自站内实时统计，不用写在这里。 */
export const ABOUT = {
  kicker: `关于 ${SITE.name}`,
  /** 大标题：第一行正常颜色，第二行强调色。 */
  headline: ["上游、中游、下游，再看海外和深度研究，", "值得看的，每天只有几条。"] as [string, string],
  /** 标题下面的一段话。{sources} 会换成实时的信源数。 */
  lead: `${SITE.name} 按上游、中游、下游看商用车产业链。政策收部委和协会的文件，数据收能核对的产销和上牌，技术收换电、氢能、自动驾驶等解释和发布。海外市场同时收可借鉴的短做法和中国车出口。深度研究收投资者日、年报战略和长案例。抓取、归并、打分、精选，每天早上 8 点出一份日报。免费，不用注册。`,
  /** 信源河动画下面的四个环节。 */
  steps: {
    collect: "行业媒体、协会与部委页面、整车和零部件官网、国内物流公司公告，以及海外卡车、车队和汽配信源都在看；活跃的源抓得更勤。",
    store: "抓到的都存下来，同一件事的报道归到一起；只计入热度的账号也算在内，热点榜就是从这里算出来的。",
    select: "模型先看是不是商用车产业链上的事、有没有销量、政策、订单、价格，或可借鉴的计价和服务模式，再写中文标题、摘要和推荐理由；短新闻留在原来的栏目，长案例进深度研究。发布会软文、纯财务手续和重复转发进不了精选。",
    publish: "每天 08:00 出日报，周一出周报，每月 1 日出月报；最精选的几条可以推到飞书群。",
  },
  /**
   * 作者块（选填），null 就不显示。
   * avatarSourceId：一个 X 账号信源的 id，头像取它的（选填）。
   * 二维码在后台“设置”里上传，或者放进 industry/brand/contact/；没有二维码就不显示那张卡片。
   */
  maker: null as null | {
    name: string;
    greeting: string[];
    avatarSourceId?: string | null;
    wechat?: { title: string; note: string };
    feishu?: { title: string; note: string };
  },
  /** 页面底部的版权与下架说明（结尾会接“反馈页”的链接）。 */
  copyright: `${SITE.name} 是聚合摘要和阅读索引，原文版权归各来源所有。如果你是来源方，希望更正、下架或调整展示方式，可以通过`,
} as const;

/** “商用车日报”这类说法：行业词和名词之间，英文词加空格，中文词不加。 */
export function withSubject(noun: string): string {
  return /[A-Za-z0-9]$/.test(SITE.subject) ? `${SITE.subject} ${noun}` : `${SITE.subject}${noun}`;
}
