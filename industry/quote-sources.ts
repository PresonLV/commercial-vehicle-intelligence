// Series pages the weekly job is allowed to open. Paths are not disallowed by chinatruck.org/robots.txt.
// Each run then opens at most a few product pages whose list cell contains a number.
export const QUOTE_LISTINGS: Array<{ url: string; series: string }> = [
  { series: "J7", url: "https://www.chinatruck.org/subbrand_449_35_0_0_0.html" },
  { series: "J7", url: "https://www.chinatruck.org/subbrand_449_37_0_0_0.html" },
  { series: "J7", url: "https://www.chinatruck.org/subbrand_449_36_0_0_0.html" },
  { series: "J6P", url: "https://www.chinatruck.org/subbrand_113_35_0_0_0.html" },
  { series: "JH6", url: "https://www.chinatruck.org/subbrand_370_35_0_0_0.html" },
  { series: "虎6", url: "https://www.chinatruck.org/subbrand_916_36_0_0_0.html" },
  { series: "天龙KL", url: "https://www.chinatruck.org/subbrand_534_35_0_0_0.html" },
  { series: "天龙旗舰", url: "https://www.chinatruck.org/subbrand_765_35_0_0_0.html" },
  { series: "汕德卡C7H", url: "https://www.chinatruck.org/subbrand_143_35_0_0_0.html" },
  { series: "汕德卡C7H", url: "https://www.chinatruck.org/subbrand_143_37_0_0_0.html" },
  { series: "豪沃TX", url: "https://www.chinatruck.org/subbrand_762_35_0_0_0.html" },
  { series: "豪沃T7H", url: "https://www.chinatruck.org/subbrand_717_35_0_0_0.html" },
  { series: "X6000", url: "https://www.chinatruck.org/subbrand_125_35_0_0_0.html" },
  { series: "X6000", url: "https://www.chinatruck.org/subbrand_125_37_0_0_0.html" },
  { series: "X5000", url: "https://www.chinatruck.org/subbrand_499_35_0_0_0.html" },
  { series: "M3000", url: "https://www.chinatruck.org/subbrand_130_35_0_0_0.html" },
  { series: "欧曼EST", url: "https://www.chinatruck.org/subbrand_440_35_0_0_0.html" },
  { series: "欧曼银河", url: "https://www.chinatruck.org/subbrand_772_35_0_0_0.html" },
  { series: "奥铃", url: "https://www.chinatruck.org/subbrand_352_36_0_0_0.html" },
  { series: "格尔发", url: "https://www.chinatruck.org/subbrand_479_35_0_0_0.html" },
  { series: "帅铃", url: "https://www.chinatruck.org/subbrand_162_36_0_0_0.html" },
  { series: "威龙", url: "https://www.chinatruck.org/subbrand_451_35_0_0_0.html" },
  { series: "V9", url: "https://www.chinatruck.org/subbrand_547_35_0_0_0.html" },
  { series: "V3", url: "https://www.chinatruck.org/subbrand_165_35_0_0_0.html" },
  { series: "杰狮", url: "https://www.chinatruck.org/subbrand_968_35_0_0_0.html" },
  { series: "三一重卡", url: "https://www.chinatruck.org/subbrand_514_35_0_0_0.html" },
  { series: "三一重卡", url: "https://www.chinatruck.org/subbrand_514_35_0_0_1.html" },
  { series: "漢風", url: "https://www.chinatruck.org/subbrand_482_35_0_0_0.html" },
  { series: "Actros", url: "https://www.chinatruck.org/subbrand_839_35_0_0_0.html" },
  { series: "FH", url: "https://www.chinatruck.org/subbrand_209_35_0_0_0.html" },
  { series: "斯堪尼亚", url: "https://www.chinatruck.org/subbrand_690_35_0_0_0.html" },
  { series: "远程换电", url: "https://www.chinatruck.org/subbrand_757_35_0_0_1.html" },
];

export const QUOTE_FETCH_PAUSE_MS = 1200;
export const QUOTE_FETCH_PRODUCT_CAP = 40;
