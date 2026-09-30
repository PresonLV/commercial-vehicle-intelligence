import { METRIC_LABELS } from "@aihot/industry/metrics";
import { data as withHeaders, useLoaderData } from "react-router";
import type { Route } from "./+types/data";
import { apiGet } from "../lib/api.server";
import { pageMeta } from "../lib/seo";

interface Point {
  metric: string;
  segment: string;
  period: string;
  value: number;
  unit: string;
  sourceName: string;
  url: string;
  sample: boolean;
}

export async function loader({ request }: Route.LoaderArgs) {
  const body = await apiGet<{ points: Point[] }>("/api/site/metrics", { signal: request.signal });
  return withHeaders(body, { headers: { "Cache-Control": "public, max-age=60" } });
}

export function meta() {
  return pageMeta({
    title: "数据",
    description: "商用车和内燃机的产量、销量、上牌量与交强险。数字只来自已收录的原文，没有原文数字的不进表。",
    path: "/data",
  });
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

function shiftPeriod(period: string, months: number): string {
  const [year, month] = period.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1 + months, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function change(current: number, previous: number | undefined): string {
  if (previous === undefined || previous === 0) return "—";
  const ratio = ((current - previous) / previous) * 100;
  return `${ratio > 0 ? "+" : ""}${ratio.toFixed(1)}%`;
}

function Trend({ points }: { points: Point[] }) {
  if (points.length < 2) return null;
  const width = 320;
  const height = 88;
  const pad = 8;
  const min = Math.min(...points.map((point) => point.value));
  const max = Math.max(...points.map((point) => point.value));
  const span = max - min || 1;
  const path = points.map((point, index) => {
    const x = pad + (index * (width - pad * 2)) / (points.length - 1);
    const y = height - pad - ((point.value - min) / span) * (height - pad * 2);
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-24 w-full max-w-md text-accent" role="img" aria-label={`${points[0]?.segment}走势`}>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function DataPage() {
  const { points } = useLoaderData<typeof loader>();
  const sample = points.some((point) => point.sample);
  const real = points.some((point) => !point.sample);
  const metrics = [...new Set(points.map((point) => point.metric))];
  return (
    <div className="pb-8">
      <h1 className="pt-4 text-[24px] font-semibold leading-[1.3] text-ink lg:pt-0">数据</h1>
      <p className="mt-2 max-w-[42rem] text-[14px] leading-relaxed text-ink-3">
        产量、销量、上牌量和交强险按细分和月份排列。同比、环比只用表里已经有的相邻期间计算。原文没有写明数字的报告不会出现在这里。
      </p>
      {sample && (
        <p className="mt-4 rounded-panel bg-bg-sunk px-4 py-3 text-[13px] leading-relaxed text-ink-2">
          {real ? "标成【样例】的行是虚构数字，只为预览表格。" : "当前表里全是【样例】。这些数字是虚构的，不是协会或企业公布的统计。"}
        </p>
      )}
      {points.length === 0 && <p className="mt-8 text-[14px] text-ink-4">还没有能从原文里抽出的数字。</p>}
      <div className="mt-6 space-y-8">
        {metrics.map((metric) => {
          const rows = points.filter((point) => point.metric === metric);
          const byKey = new Map(rows.map((point) => [`${point.segment}|${point.period}|${point.unit}`, point]));
          const chartKey = rows.reduce<{ segment: string; unit: string; count: number } | null>((best, point) => {
            const count = rows.filter((row) => row.segment === point.segment && row.unit === point.unit).length;
            return !best || count > best.count ? { segment: point.segment, unit: point.unit, count } : best;
          }, null);
          const chart = chartKey
            ? rows.filter((point) => point.segment === chartKey.segment && point.unit === chartKey.unit).sort((a, b) => a.period.localeCompare(b.period))
            : [];
          return (
            <section key={metric}>
              <h2 className="text-[18px] font-semibold text-ink">{METRIC_LABELS[metric] ?? metric}</h2>
              {chart.length >= 2 && (
                <div>
                  <div className="mt-1 text-[12px] text-ink-4">{chartKey?.segment} · {chartKey?.unit}</div>
                  <Trend points={chart} />
                </div>
              )}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-line text-ink-4">
                      <th className="py-2 pr-3 font-medium">期间</th>
                      <th className="py-2 pr-3 font-medium">细分</th>
                      <th className="py-2 pr-3 font-medium">数值</th>
                      <th className="py-2 pr-3 font-medium">单位</th>
                      <th className="py-2 pr-3 font-medium">环比</th>
                      <th className="py-2 pr-3 font-medium">同比</th>
                      <th className="py-2 font-medium">来源</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((point) => {
                      const previous = byKey.get(`${point.segment}|${shiftPeriod(point.period, -1)}|${point.unit}`);
                      const yearAgo = byKey.get(`${point.segment}|${shiftPeriod(point.period, -12)}|${point.unit}`);
                      return (
                        <tr key={`${point.segment}-${point.period}-${point.url}`} className="border-b border-line-soft">
                          <td className="py-2 pr-3 num">{point.period}</td>
                          <td className="py-2 pr-3">{point.segment}</td>
                          <td className="py-2 pr-3 num">{point.value}</td>
                          <td className="py-2 pr-3">{point.unit}</td>
                          <td className="py-2 pr-3 num">{change(point.value, previous?.value)}</td>
                          <td className="py-2 pr-3 num">{change(point.value, yearAgo?.value)}</td>
                          <td className="py-2">
                            <a href={point.url} className="text-accent hover:underline" target="_blank" rel="noreferrer">
                              {point.sample ? "【样例】" : ""}{point.sourceName}
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
