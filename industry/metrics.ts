/**
 * 从已经写进正文的句子里抽取产销数字。句子必须同时写明年月、细分、指标、数值和单位。
 * 缺任何一项就不收录，避免把同比百分比或形容词当成统计值。
 */
const SEGMENT = "新能源商用车|重卡|中卡|轻卡|微卡|工程机械|农机|船用|发电|客车|商用车";
const SENTENCE = /(20\d{2})年(\d{1,2})月([^。\n]*)/g;
const FIGURE = new RegExp(
  `(${SEGMENT})[^，,。\\n]{0,16}?(产量|销量|上牌量|上牌|交强险)[^，,。\\n\\d]{0,8}(\\d+(?:\\.\\d+)?)\\s*(万辆|万台|辆|台)`,
  "g",
);

const METRIC_OF: Record<string, string> = {
  产量: "production",
  销量: "sales",
  上牌量: "registrations",
  上牌: "registrations",
  交强险: "insurance",
};

export interface MetricPoint {
  metric: string;
  segment: string;
  period: string;
  value: number;
  unit: string;
}

export function extractMetricPoints(text: string): MetricPoint[] {
  const out: MetricPoint[] = [];
  const seen = new Set<string>();
  for (const sentence of text.matchAll(SENTENCE)) {
    const year = sentence[1]!;
    const month = sentence[2]!.padStart(2, "0");
    if (Number(month) < 1 || Number(month) > 12) continue;
    const period = `${year}-${month}`;
    for (const match of sentence[3]!.matchAll(FIGURE)) {
      const segment = match[1]!;
      const metric = METRIC_OF[match[2]!]!;
      const value = Number(match[3]);
      const unit = match[4]!;
      if (!Number.isFinite(value)) continue;
      const key = `${metric}|${segment}|${period}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ metric, segment, period, value, unit });
    }
  }
  return out;
}

export const METRIC_LABELS: Record<string, string> = {
  production: "产量",
  sales: "销量",
  registrations: "上牌量",
  insurance: "交强险",
};
