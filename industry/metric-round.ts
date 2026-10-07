// Figures copied on 2026-10-01 from fetched pages and pdftotext output.
// Chart images on the CAAM 2004–2020 pages were OCR'd locally and only returned axis ticks, so those are not here.
// Each excerpt is a span of the cited page. A 产销 pair is production then sales.
import type { Grain } from "./metrics-view.ts";
import type { SeedMetric } from "./metric-seed.ts";

function row(
  metric: SeedMetric["metric"], segment: string, brand: string, period: string, grain: Grain,
  value: number, unit: SeedMetric["unit"], sourceName: string, url: string, excerpt: string,
  brandText = "", page = "",
): SeedMetric {
  return { metric, segment, brand, brandText: brandText || undefined, period, grain, value, unit, sourceName, url, excerpt, page: page || undefined };
}

function pair(
  segment: string, period: string, grain: Grain, production: number, sales: number,
  sourceName: string, url: string, excerpt: string,
): SeedMetric[] {
  return [
    row("production", segment, "", period, grain, production, "万辆", sourceName, url, excerpt),
    row("sales", segment, "", period, grain, sales, "万辆", sourceName, url, excerpt),
  ];
}

const CAAM19 = "中国汽车工业协会";
const U19 = "http://www.caam.org.cn/chn/4/cate_39/con_5228367.html";
const E19CV = "商用车产销分别完成436万辆和432.4万辆";
const E19BUS = "客车产销分别完成47.2万辆和47.4万辆";
const E19TRUCK = "货车产销分别完成388.8万辆和385万辆";
const E19HEAVY = "重型货车产销分别完成119.3万辆和117.4万辆";

const U18 = "http://www.caam.org.cn/search/con_5221202.html";
const E18CV = "商用车产销分别达到428万辆和437.1万辆";
const E18BUS = "客车产销量分别完成48.9万辆和48.5万辆";
const E18TRUCK = "货车产销量分别完成379.1万辆和388.6万辆";
const E18HEAVY = "重型货车产销分别达到111.2万辆和114.8万辆";

const U17 = "http://www.caam.org.cn/search/con_5214622.html";
const E17CV = "分别达到420.9万辆和416.1万辆";
const E17BUS = "客车产销量分别完成52.6万辆和52.7万辆";
const E17TRUCK = "货车产销量分别完成368.3万辆和363.3万辆";
const E17HEAVY = "重型货车产销分别达到115万辆和111.7万辆";

const U16 = "http://www.caam.org.cn/search/con_5205537.html";
const E16CV = "2016年，商用车产销分别完成369.8万辆和365.1万辆";

const CE = "中国商用汽车网";
const U2501 = "http://cv.ce.cn/news/202502/18/t20250218_39295385.shtml";
const U2503 = "http://www.caam.org.cn/chn/4/cate_31/con_5236695.html";
const U2505 = "https://www.auto-parts.org.cn/news/90360";
const U2506 = "http://cv.ce.cn/news/202507/t20250710_2402587.shtml";
const U2508 = "http://cv.ce.cn/news/202509/t20250912_2472855.shtml";
const U2511 = "http://cv.ce.cn/news/202512/t20251212_2638916.shtml";
const U2502 = "https://news.qq.com/rain/a/20250316A036O300";
const U2601 = "https://www.jc35.com/news/detail/94432.html";
const U2602 = "http://cv.ce.cn/news/202603/t20260311_2821151.shtml";
const U2603 = "http://cv.ce.cn/news/202604/t20260410_2895261.shtml";
const U2604 = "https://www.bjcv.com/node/50377";
const U2605 = "http://www.360trucks.cn/news/2026/0610/109682.shtml";
const U2605B = "https://www.mmsonline.com.cn/info/346024.shtml";

const PARTS = "汽车摩托车配件商会";
const QQ = "汽车人";
const JC = "中汽协会数据";
const BJ = "北京商用车网";
const TRUCKS = "卡车信息网";
const MM = "国际金属加工网";

const JF = "http://static.cninfo.com.cn/finalpage/2023-04-01/1216303118.PDF";
const JF_EXCERPT = [
  "一汽解放集团股份有限公司 2022 年年度报告全文",
  "中重型卡车       123,011   320,485    -61.62%    140,384   373,420    -62.41%",
  "轻型卡车         27,560    54,051    -49.01%     29,414    65,335    -54.98%",
  "客车              241       904    -73.34%        251       905    -72.27%",
  "合计          150,812   375,440    -59.83%    170,049   439,660    -61.32%",
  "销售量              辆               170,049     439,660    -61.32%",
  "生产量              辆               150,812     375,440    -59.83%",
].join("\n");

function jinan(year: string, url: string, page: string, product: string, unitLine: string): { url: string; page: string; excerpt: string; year: string } {
  return {
    year, url, page,
    excerpt: `中国重汽集团济南卡车股份有限公司\n${product}\n${unitLine}`,
  };
}

const J22 = jinan("2022", "http://static.cninfo.com.cn/finalpage/2023-03-31/1216280281.PDF", "10",
  "重型货车        73,680    152,164      -51.58%           96,037           202,172         -52.50%",
  "销售量                    辆                        96,037.00           202,172.00      -52.50%\n生产量                    辆                        73,680.00           152,164.00      -51.58%");
const J23 = jinan("2023", "http://static.cninfo.com.cn/finalpage/2024-03-26/1219405632.PDF", "11",
  "重型货车       100,964    73,680     37.03%         127,519         96,037         32.78%",
  "销售量                 辆                   127,519             96,037.00              32.78%\n生产量                 辆                   100,964             73,680.00              37.03%");
const J24 = jinan("2024", "http://static.cninfo.com.cn/finalpage/2025-03-28/1222930065.PDF", "13",
  "重型货车       112,656   100,964    11.58%   132,986     127,519        4.29%",
  "销售量                      辆                     132,986                127,519          4.29%\n生产量                      辆                     112,656                100,964          11.58%");
const J25 = jinan("2025", "http://static.cninfo.com.cn/finalpage/2026-03-28/1225044074.PDF", "11",
  "重型货车       158,871   112,656    41.02%   173,909    132,986    30.77%",
  "销售量              辆                        173,909              132,986              30.77%\n生产量              辆                        158,871              112,656              41.02%");

const HK25 = "https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0430/2026043000288_c.pdf";
const HK24 = "https://www1.hkexnews.hk/listedco/listconews/sehk/2025/0429/2025042901957_c.pdf";
const HK_NAME = "中國重汽（香港）有限公司";
const HK25_EXCERPT = [
  "SINOTRUK (HONG KONG) LIMITED 中國重汽（香港）有限公司",
  "Sales volume (units)                         銷售量（輛）",
  "— 內銷            138,772       109,380    29,392           26.9",
  "— 外銷（包括聯營出口）    153,368       134,038    19,330           14.4",
  "總數              292,140       243,418    48,722           20.0",
  "輕卡               123,136       100,542    22,594           22.5",
].join("\n");
const HK24_EXCERPT = [
  "中國重汽（香港）有限公司",
  "2024 年 報 | 中 國 重 汽（ 香 港 ）有 限 公 司",
  "銷售量（輛）",
  "— 內銷                              109,380    96,938   12,442     12.8",
  "— 外銷（包括聯營出口）                   134,038   130,061    3,977      3.1",
  "總數                             243,418   226,999   16,419      7.2",
  "輕卡                                 100,542    96,567    3,975      4.1",
].join("\n");

const YUCHAI = "https://www.sec.gov/Archives/edgar/data/932695/000119312526191559/ck0000932695-20251231.htm";
const YUCHAI_ENGINES = "Yuchai offers a portfolio of diesel, natural gas and alternate fuels combustion engines\nIn 2024, our engine sales increased by 13.7% to 356,586 units, compared to 313,493 units in 2023. In 2025, our engine sales further increased by 29.4% to 461,309 units, compared to 356,586 units in 2024.";
const YUCHAI_GAS = "In 2025, Yuchai sold 24,591 units of natural gas engines compared with 11,279 units sold in 2024.";

const heavy = (period: string, grain: Grain, value: number, sourceName: string, url: string, excerpt: string) =>
  row("sales", "重型货车", "", period, grain, value, "万辆", sourceName, url, excerpt);

export const ROUND_SEED: SeedMetric[] = [
  ...pair("商用车", "2019", "year", 436, 432.4, CAAM19, U19, E19CV),
  ...pair("客车", "2019", "year", 47.2, 47.4, CAAM19, U19, E19BUS),
  ...pair("货车", "2019", "year", 388.8, 385, CAAM19, U19, E19TRUCK),
  ...pair("重型货车", "2019", "year", 119.3, 117.4, CAAM19, U19, E19HEAVY),
  ...pair("商用车", "2018", "year", 428, 437.1, CAAM19, U18, E18CV),
  ...pair("客车", "2018", "year", 48.9, 48.5, CAAM19, U18, E18BUS),
  ...pair("货车", "2018", "year", 379.1, 388.6, CAAM19, U18, E18TRUCK),
  ...pair("重型货车", "2018", "year", 111.2, 114.8, CAAM19, U18, E18HEAVY),
  ...pair("商用车", "2017", "year", 420.9, 416.1, CAAM19, U17, E17CV),
  ...pair("客车", "2017", "year", 52.6, 52.7, CAAM19, U17, E17BUS),
  ...pair("货车", "2017", "year", 368.3, 363.3, CAAM19, U17, E17TRUCK),
  ...pair("重型货车", "2017", "year", 115, 111.7, CAAM19, U17, E17HEAVY),
  ...pair("商用车", "2016", "year", 369.8, 365.1, CAAM19, U16, E16CV),

  ...pair("商用车", "2025-01", "month", 29.9, 29, CE, U2501, "1月，商用车产销分别完成29.9万辆和29万辆"),
  ...pair("货车", "2025-01", "month", 26.2, 25.3, CE, U2501, "1月，货车产销分别完成26.2万辆和25.3万辆"),
  ...pair("客车", "2025-01", "month", 3.7, 3.8, CE, U2501, "客车产销分别完成3.7万辆和3.8万辆"),
  ...pair("商用车", "2025-02", "month", 31.8, 31.3, QQ, U2502, "2月，商用车产销分别完成31.8万辆和31.3万辆"),
  ...pair("商用车", "2025-02", "ytd", 61.7, 60.4, QQ, U2502, "1-2月商用车产销累计完成61.7万辆和60.4万辆"),
  ...pair("货车", "2025-02", "month", 28.1, 27.9, QQ, U2502, "2月，货车产销分别完成28.1万辆和27.9万辆"),
  ...pair("客车", "2025-02", "month", 3.6, 3.4, QQ, U2502, "客车产销分别完成3.6万辆和3.4万辆"),
  ...pair("商用车", "2025-03", "month", 43.1, 44.7, CAAM19, U2503, "2025年3月，商用车产销分别完成43.1万辆和44.7万辆"),
  ...pair("商用车", "2025-03", "ytd", 104.8, 105.1, CAAM19, U2503, "2025年1-3月，商用车产销分别完成104.8万辆和105.1万辆"),
  ...pair("客车", "2025-03", "month", 5, 5.3, CAAM19, U2503, "2025年3月，客车产销分别完成5万辆和5.3万辆"),
  ...pair("客车", "2025-03", "ytd", 12.3, 12.5, CAAM19, U2503, "2025年1-3月，客车产销分别完成12.3万辆和12.5万辆"),
  ...pair("货车", "2025-03", "month", 38.1, 39.4, CAAM19, U2503, "2025年3月，货车产销分别完成38.1万辆和39.4万辆"),
  ...pair("货车", "2025-03", "ytd", 92.5, 92.6, CAAM19, U2503, "2025年1-3月，货车产销分别完成92.5万辆和92.6万辆"),
  ...pair("商用车", "2025-05", "month", 33.6, 33.5, PARTS, U2505, "2025年5月，商用车产销分别完成33.6万辆和33.5万辆"),
  ...pair("商用车", "2025-05", "ytd", 174.6, 175.3, PARTS, U2505, "2025年1-5月，商用车产销分别完成174.6万辆和175.3万辆"),
  ...pair("客车", "2025-05", "month", 4.4, 4.3, PARTS, U2505, "2025年5月，客车产销分别完成4.4万辆和4.3万辆"),
  ...pair("客车", "2025-05", "ytd", 21.2, 21.2, PARTS, U2505, "2025年1-5月，客车产销均完成21.2万辆"),
  ...pair("货车", "2025-05", "month", 29.2, 29.2, PARTS, U2505, "2025年5月，货车产销均完成29.2万辆"),
  ...pair("货车", "2025-05", "ytd", 153.4, 154, PARTS, U2505, "2025年1-5月，货车产销分别完成153.4万辆和154万辆"),
  ...pair("商用车", "2025-06", "month", 35.4, 36.9, CE, U2506, "6月，商用车产销分别完成35.4万辆和36.9万辆"),
  ...pair("商用车", "2025-06", "ytd", 209.9, 212.2, CE, U2506, "1-6月，商用车产销分别完成209.9万辆和212.2万辆"),
  ...pair("货车", "2025-06", "month", 30.4, 31.6, CE, U2506, "6月，货车产销分别完成30.4万辆和31.6万辆"),
  ...pair("货车", "2025-06", "ytd", 183.7, 185.6, CE, U2506, "1-6月，货车产销分别完成183.7万辆和185.6万辆"),
  heavy("2025-06", "month", 9.8, CE, U2506, "重型货车销量9.8万辆"),
  heavy("2025-06", "ytd", 53.9, CE, U2506, "重型货车销量53.9万辆"),
  ...pair("客车", "2025-06", "month", 5, 5.3, CE, U2506, "6月，客车产销分别完成5万辆和5.3万辆"),
  ...pair("客车", "2025-06", "ytd", 26.2, 26.5, CE, U2506, "1-6月，客车产销分别完成26.2万辆和26.5万辆"),
  ...pair("商用车", "2025-08", "month", 31.5, 31.6, CE, U2508, "8月，商用车产销分别完成31.5万辆和31.6万辆"),
  ...pair("商用车", "2025-08", "ytd", 271.3, 274.4, CE, U2508, "1-8月，商用车产销分别完成271.3万辆和274.4万辆"),
  ...pair("货车", "2025-08", "month", 27, 27.2, CE, U2508, "8月，货车产销分别完成27万辆和27.2万辆"),
  ...pair("货车", "2025-08", "ytd", 236.2, 239.3, CE, U2508, "1-8月，货车产销分别完成236.2万辆和239.3万辆"),
  heavy("2025-08", "month", 9.2, CE, U2508, "重型货车销量9.2万辆"),
  heavy("2025-08", "ytd", 71.6, CE, U2508, "重型货车销量71.6万辆"),
  ...pair("客车", "2025-08", "month", 4.5, 4.5, CE, U2508, "8月，客车产销均完成4.5万辆"),
  ...pair("客车", "2025-08", "ytd", 35, 35.1, CE, U2508, "1-8月，客车产销分别完成35万辆和35.1万辆"),
  ...pair("商用车", "2025-11", "month", 38.8, 39.2, CE, U2511, "11月，商用车产销分别完成38.8万辆和39.2万辆"),
  ...pair("商用车", "2025-11", "ytd", 384.3, 387, CE, U2511, "1-11月，商用车产销分别完成384.3万辆和387万辆"),
  ...pair("货车", "2025-11", "month", 33.3, 33.8, CE, U2511, "11月，货车产销分别完成33.3万辆和33.8万辆"),
  ...pair("货车", "2025-11", "ytd", 333.5, 336, CE, U2511, "1-11月，货车产销分别完成333.5万辆和336万辆"),
  heavy("2025-11", "month", 11.3, CE, U2511, "重型货车销量11.3万辆"),
  heavy("2025-11", "ytd", 104.2, CE, U2511, "重型货车销量104.2万辆"),
  ...pair("客车", "2025-11", "month", 5.5, 5.3, CE, U2511, "11月，客车产销分别完成5.5万辆和5.3万辆"),
  ...pair("客车", "2025-11", "ytd", 50.8, 51, CE, U2511, "1-11月，客车产销分别完成50.8万辆和51万辆"),

  ...pair("商用车", "2026-01", "month", 38.8, 35.9, JC, U2601, "2026年1月，商用车产销分别完成38.8万辆和35.9万辆"),
  ...pair("客车", "2026-01", "month", 3.8, 3.5, JC, U2601, "2026年1月，客车产销分别完成3.8万辆和3.5万辆"),
  ...pair("货车", "2026-01", "month", 35, 32.3, JC, U2601, "2026年1月，货车产销分别完成35万辆和32.3万辆"),
  ...pair("商用车", "2026-02", "month", 27.3, 26.9, CE, U2602, "2月，商用车产销分别完成27.3万辆和26.9万辆"),
  ...pair("商用车", "2026-02", "ytd", 66, 62.7, CE, U2602, "1-2月，商用车产销分别完成66万辆和62.7万辆"),
  ...pair("货车", "2026-02", "month", 24.5, 24, CE, U2602, "2月，货车产销分别完成24.5万辆和24万辆"),
  ...pair("货车", "2026-02", "ytd", 59.4, 56.3, CE, U2602, "1-2月，货车产销分别完成59.4万辆和56.3万辆"),
  heavy("2026-02", "month", 7.4, CE, U2602, "重型货车销量7.4万辆"),
  heavy("2026-02", "ytd", 17.9, CE, U2602, "重型货车销量17.9万辆"),
  ...pair("客车", "2026-02", "month", 2.8, 2.9, CE, U2602, "2月，客车产销分别完成2.8万辆和2.9万辆"),
  ...pair("客车", "2026-02", "ytd", 6.6, 6.4, CE, U2602, "1-2月，客车产销分别完成6.6万辆和6.4万辆"),
  ...pair("商用车", "2026-03", "month", 47.1, 48.7, CE, U2603, "3月，商用车产销分别完成47.1万辆和48.7万辆"),
  ...pair("商用车", "2026-03", "ytd", 113, 111.4, CE, U2603, "一季度，商用车产销分别完成113万辆和111.4万辆"),
  ...pair("货车", "2026-03", "month", 42, 44, CE, U2603, "3月，货车产销分别完成42万辆和44万辆"),
  ...pair("货车", "2026-03", "ytd", 101.4, 100.3, CE, U2603, "一季度，货车产销分别完成101.4万辆和100.3万辆"),
  heavy("2026-03", "month", 13.9, CE, U2603, "重型货车销量13.9万辆"),
  heavy("2026-03", "ytd", 31.8, CE, U2603, "重型货车销量31.8万辆"),
  ...pair("客车", "2026-03", "month", 5.1, 4.7, CE, U2603, "3月，客车产销分别完成5.1万辆和4.7万辆"),
  ...pair("客车", "2026-03", "ytd", 11.6, 11.1, CE, U2603, "一季度，客车产销分别完成11.6万辆和11.1万辆"),
  ...pair("商用车", "2026-04", "month", 37.8, 39.7, BJ, U2604, "4月，商用车产销分别完成37.8万辆和39.7万辆"),
  ...pair("商用车", "2026-04", "ytd", 150.8, 151.1, BJ, U2604, "1—4月，商用车产销分别完成150.8万辆和151.1万辆"),
  ...pair("货车", "2026-04", "month", 32.7, 34.4, BJ, U2604, "4月，货车产销分别完成32.7万辆和34.4万辆"),
  ...pair("货车", "2026-04", "ytd", 134.1, 134.7, BJ, U2604, "1—4月，货车产销分别完成134.1万辆和134.7万辆"),
  heavy("2026-04", "month", 11.7, BJ, U2604, "重型货车销量11.7万辆"),
  heavy("2026-04", "ytd", 43.5, BJ, U2604, "重型货车销量43.5万辆"),
  ...pair("客车", "2026-04", "month", 5.1, 5.3, BJ, U2604, "4月，客车产销分别完成5.1万辆和5.3万辆"),
  ...pair("客车", "2026-04", "ytd", 16.7, 16.4, BJ, U2604, "1—4月，客车产销分别完成16.7万辆和16.4万辆"),
  ...pair("商用车", "2026-05", "month", 37.5, 37.6, TRUCKS, U2605, "5月，商用车产销分别完成37.5万辆和37.6万辆"),
  ...pair("商用车", "2026-05", "ytd", 188.6, 188.8, TRUCKS, U2605, "1-5月，商用车产销累计完成188.6万辆和188.8万辆"),
  ...pair("客车", "2026-05", "month", 5.2, 5.3, MM, U2605B, "2026年5月，客车产销分别完成5.2万辆和5.3万辆"),
  ...pair("客车", "2026-05", "ytd", 21.9, 21.7, MM, U2605B, "2026年1-5月，客车产销分别完成21.9万辆和21.7万辆"),
  ...pair("货车", "2026-05", "month", 32.3, 32.3, TRUCKS, U2605, "5月，货车产销均完成32.3万辆"),
  ...pair("货车", "2026-05", "ytd", 166.7, 167.2, TRUCKS, U2605, "1-5月，货车产销分别完成166.7万辆和167.2万辆"),
  heavy("2026-05", "month", 10.9, TRUCKS, U2605, "重型货车销量10.9万辆"),
  heavy("2026-05", "ytd", 54.4, TRUCKS, U2605, "重型货车销量54.4万辆"),

  row("production", "中重型卡车", "一汽解放", "2022", "year", 123011, "辆", "一汽解放年报", JF, JF_EXCERPT, "", "12"),
  row("sales", "中重型卡车", "一汽解放", "2022", "year", 140384, "辆", "一汽解放年报", JF, JF_EXCERPT, "", "12"),
  row("production", "轻型卡车", "一汽解放", "2022", "year", 27560, "辆", "一汽解放年报", JF, JF_EXCERPT, "", "12"),
  row("sales", "轻型卡车", "一汽解放", "2022", "year", 29414, "辆", "一汽解放年报", JF, JF_EXCERPT, "", "12"),
  row("production", "客车", "一汽解放", "2022", "year", 241, "辆", "一汽解放年报", JF, JF_EXCERPT, "", "12"),
  row("sales", "客车", "一汽解放", "2022", "year", 251, "辆", "一汽解放年报", JF, JF_EXCERPT, "", "12"),
  row("production", "整车合计", "一汽解放", "2022", "year", 150812, "辆", "一汽解放年报", JF, JF_EXCERPT, "", "12"),
  row("sales", "整车合计", "一汽解放", "2022", "year", 170049, "辆", "一汽解放年报", JF, JF_EXCERPT, "", "12"),

  row("production", "重型货车", "中国重汽", J22.year, "year", 73680, "辆", "中国重汽年报", J22.url, J22.excerpt, "中国重汽集团济南卡车股份有限公司", J22.page),
  row("sales", "重型货车", "中国重汽", J22.year, "year", 96037, "辆", "中国重汽年报", J22.url, J22.excerpt, "中国重汽集团济南卡车股份有限公司", J22.page),
  row("production", "重型货车", "中国重汽", J23.year, "year", 100964, "辆", "中国重汽年报", J23.url, J23.excerpt, "中国重汽集团济南卡车股份有限公司", J23.page),
  row("sales", "重型货车", "中国重汽", J23.year, "year", 127519, "辆", "中国重汽年报", J23.url, J23.excerpt, "中国重汽集团济南卡车股份有限公司", J23.page),
  row("production", "重型货车", "中国重汽", J24.year, "year", 112656, "辆", "中国重汽年报", J24.url, J24.excerpt, "中国重汽集团济南卡车股份有限公司", J24.page),
  row("sales", "重型货车", "中国重汽", J24.year, "year", 132986, "辆", "中国重汽年报", J24.url, J24.excerpt, "中国重汽集团济南卡车股份有限公司", J24.page),
  row("production", "重型货车", "中国重汽", J25.year, "year", 158871, "辆", "中国重汽年报", J25.url, J25.excerpt, "中国重汽集团济南卡车股份有限公司", J25.page),
  row("sales", "重型货车", "中国重汽", J25.year, "year", 173909, "辆", "中国重汽年报", J25.url, J25.excerpt, "中国重汽集团济南卡车股份有限公司", J25.page),

  row("sales", "重卡内销", "中国重汽", "2025", "year", 138772, "辆", "中国重汽（香港）年报", HK25, HK25_EXCERPT, HK_NAME, "2"),
  row("sales", "重卡内销", "中国重汽", "2024", "year", 109380, "辆", "中国重汽（香港）年报", HK25, HK25_EXCERPT, HK_NAME, "2"),
  row("sales", "重卡外销", "中国重汽", "2025", "year", 153368, "辆", "中国重汽（香港）年报", HK25, HK25_EXCERPT, HK_NAME, "2"),
  row("sales", "重卡外销", "中国重汽", "2024", "year", 134038, "辆", "中国重汽（香港）年报", HK25, HK25_EXCERPT, HK_NAME, "2"),
  row("sales", "重卡分部", "中国重汽", "2025", "year", 292140, "辆", "中国重汽（香港）年报", HK25, HK25_EXCERPT, HK_NAME, "2"),
  row("sales", "重卡分部", "中国重汽", "2024", "year", 243418, "辆", "中国重汽（香港）年报", HK25, HK25_EXCERPT, HK_NAME, "2"),
  row("sales", "轻卡分部", "中国重汽", "2025", "year", 123136, "辆", "中国重汽（香港）年报", HK25, HK25_EXCERPT, HK_NAME, "2"),
  row("sales", "轻卡分部", "中国重汽", "2024", "year", 100542, "辆", "中国重汽（香港）年报", HK25, HK25_EXCERPT, HK_NAME, "2"),
  row("sales", "重卡内销", "中国重汽", "2023", "year", 96938, "辆", "中国重汽（香港）年报", HK24, HK24_EXCERPT, HK_NAME, "2"),
  row("sales", "重卡外销", "中国重汽", "2023", "year", 130061, "辆", "中国重汽（香港）年报", HK24, HK24_EXCERPT, HK_NAME, "2"),
  row("sales", "重卡分部", "中国重汽", "2023", "year", 226999, "辆", "中国重汽（香港）年报", HK24, HK24_EXCERPT, HK_NAME, "2"),
  row("sales", "轻卡分部", "中国重汽", "2023", "year", 96567, "辆", "中国重汽（香港）年报", HK24, HK24_EXCERPT, HK_NAME, "2"),

  row("sales", "发动机", "玉柴", "2025", "year", 461309, "台", "玉柴 20-F", YUCHAI, YUCHAI_ENGINES, "Yuchai"),
  row("sales", "发动机", "玉柴", "2024", "year", 356586, "台", "玉柴 20-F", YUCHAI, YUCHAI_ENGINES, "Yuchai"),
  row("sales", "发动机", "玉柴", "2023", "year", 313493, "台", "玉柴 20-F", YUCHAI, YUCHAI_ENGINES, "Yuchai"),
  row("sales", "天然气发动机", "玉柴", "2025", "year", 24591, "台", "玉柴 20-F", YUCHAI, YUCHAI_GAS, "Yuchai"),
  row("sales", "天然气发动机", "玉柴", "2024", "year", 11279, "台", "玉柴 20-F", YUCHAI, YUCHAI_GAS, "Yuchai"),
];
