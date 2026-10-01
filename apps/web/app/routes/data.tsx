import { useMemo, useState, type ReactNode } from "react";
import { METRIC_LABELS } from "@aihot/industry/metrics";
import { METRIC_GAPS } from "@aihot/industry/metric-gaps";
import { normalizeUnit } from "@aihot/industry/metric-units";
import {
  annualSeries, brandRank, brandRankNormalized, coverageLines, formatChange, periodLabel, readYtd, readYtdAt, visiblePoints, yearChange, ytdChange,
  type Grain, type MetricViewPoint,
} from "@aihot/industry/metrics-view";
import { data as withHeaders, useLoaderData } from "react-router";
import type { Route } from "./+types/data";
import { apiGet } from "../lib/api.server";
import { pageMeta } from "../lib/seo";

interface Point extends MetricViewPoint {}

const GRAIN_LABEL: Record<Grain, string> = { year: "年度", month: "单月", ytd: "累计" };

export async function loader({ request }: Route.LoaderArgs) {
  const body = await apiGet<{ points: Point[] }>("/api/site/metrics", { signal: request.signal });
  return withHeaders(body, { headers: { "Cache-Control": "public, max-age=60" } });
}

export function meta() {
  return pageMeta({
    title: "数据统计",
    description: "商用车和内燃机的产量、销量、上牌量，按年度、累计和品牌排列。每个数字都链到原文。",
    path: "/data",
  });
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

function published(value: number, unit: string): string {
  const norm = normalizeUnit(value, unit);
  if (!norm.converted) return `${value} ${unit}`;
  return `${value} ${unit}（折合 ${norm.value.toLocaleString("zh-CN")} ${norm.unit}）`;
}

function preferredUnit(points: Point[]): string {
  const counts = new Map<string, number>();
  for (const point of points) counts.set(point.unit, (counts.get(point.unit) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

function LineChart({ points }: { points: Point[] }) {
  if (points.length < 2) return null;
  const width = 360;
  const height = 96;
  const pad = 16;
  const min = Math.min(...points.map((point) => point.value));
  const max = Math.max(...points.map((point) => point.value));
  const span = max - min || 1;
  const coords = points.map((point, index) => {
    const x = pad + (index * (width - pad * 2)) / (points.length - 1);
    const y = height - pad - ((point.value - min) / span) * (height - pad * 2);
    return { x, y, point };
  });
  const path = coords.map((dot, index) => `${index === 0 ? "M" : "L"}${dot.x.toFixed(1)},${dot.y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-28 w-full max-w-lg text-accent" role="img" aria-label="年度走势">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
      {coords.map((dot) => <circle key={dot.point.period} cx={dot.x} cy={dot.y} r="3" fill="currentColor" />)}
    </svg>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-[12px] text-ink-4">
      {label}
      <select className="h-9 min-w-36 rounded-control bg-bg px-2 text-[13px] text-ink ring-1 ring-line" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

export default function DataPage() {
  const loaded = useLoaderData<typeof loader>();
  const points = useMemo(() => visiblePoints((loaded.points ?? []).map((point) => ({ ...point, grain: point.grain ?? "month", brand: point.brand ?? "" }))), [loaded.points]);
  const sampleLeft = points.some((point) => point.sample);
  const metrics = [...new Set(points.map((point) => point.metric))];
  const [metric, setMetric] = useState(metrics.includes("sales") ? "sales" : metrics[0] ?? "sales");
  const segments = [...new Set(points.filter((point) => point.metric === metric).map((point) => point.segment))].sort((a, b) => a.localeCompare(b, "zh"));
  const [segment, setSegment] = useState(segments.includes("商用车") ? "商用车" : segments[0] ?? "");
  const segmentPoints = points.filter((point) => point.metric === metric && point.segment === segment);
  const brands = [...new Set(segmentPoints.map((point) => point.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh"));
  const [brand, setBrand] = useState("");
  const seriesPool = segmentPoints.filter((point) => point.brand === brand);
  const seriesUnits = [...new Set(seriesPool.map((point) => point.unit))];
  const [unit, setUnit] = useState("");
  const seriesUnit = seriesUnits.includes(unit) ? unit : preferredUnit(seriesPool.filter((point) => !point.brand || point.brand === brand));
  const series = seriesPool.filter((point) => point.unit === seriesUnit);
  const annual = annualSeries(series, { metric, segment, brand, unit: seriesUnit });
  const yoy = yearChange(annual);
  const ytd2026 = readYtd(points, { metric, segment, brand, year: "2026", unit: seriesUnit });
  const ytd2025 = ytd2026.endMonth
    ? readYtdAt(points, { metric, segment, brand, year: "2025", unit: seriesUnit }, ytd2026.endMonth)
    : readYtd(points, { metric, segment, brand, year: "2025", unit: seriesUnit });
  const ytdRatio = ytdChange(ytd2026, ytd2025);
  const months2026 = series.filter((point) => point.grain === "month" && point.period.startsWith("2026-")).sort((a, b) => a.period.localeCompare(b.period));
  const rankPool = segmentPoints.filter((point) => point.brand);
  const rankUnits = [...new Set(rankPool.map((point) => point.unit))];
  const [rankUnit, setRankUnit] = useState("");
  const rankUnitValue = rankUnits.includes(rankUnit) ? rankUnit : preferredUnit(rankPool);
  const mixedRank = (rankUnits.includes("万辆") && rankUnits.includes("辆")) || (rankUnits.includes("万台") && rankUnits.includes("台"));
  const rankSource = mixedRank ? rankPool : rankPool.filter((point) => point.unit === rankUnitValue);
  const rankGrains = [...new Set(rankSource.map((point) => point.grain))];
  const [rankGrain, setRankGrain] = useState<Grain>("year");
  const grain = rankGrains.includes(rankGrain) ? rankGrain : rankGrains[0] ?? "year";
  const rankPeriods = [...new Set(rankSource.filter((point) => point.grain === grain).map((point) => point.period))].sort();
  const [rankPeriod, setRankPeriod] = useState("");
  const period = rankPeriods.includes(rankPeriod) ? rankPeriod : rankPeriods.at(-1) ?? "";
  const ranking = mixedRank
    ? brandRankNormalized(points, { metric, segment, period, grain })
    : brandRank(points, { metric, segment, period, grain, unit: rankUnitValue });
  const coverage = coverageLines(points);
  const otherBrandUnit = rankUnits.find((item) => item !== seriesUnit);

  const chooseMetric = (next: string) => {
    setMetric(next);
    const nextSegments = [...new Set(points.filter((point) => point.metric === next).map((point) => point.segment))];
    setSegment(nextSegments.includes(segment) ? segment : nextSegments.includes("商用车") ? "商用车" : nextSegments[0] ?? "");
    setBrand("");
    setUnit("");
    setRankUnit("");
  };
  const chooseSegment = (next: string) => {
    setSegment(next);
    setBrand("");
    setUnit("");
    setRankUnit("");
    setRankPeriod("");
  };

  return (
    <div className="pb-8">
      <h1 className="pt-4 text-[24px] font-semibold leading-[1.3] text-ink lg:pt-0">数据统计</h1>
      <p className="mt-2 max-w-[42rem] text-[14px] leading-relaxed text-ink-3">
        产量、销量和上牌量按年度、单月和累计排列，并可按品牌筛选。同比用同一截止月的水平值。万辆、万台按公布数字乘以 10000 折成辆、台，原文数字仍写在前面。每个数字链到写出它的原文。
      </p>
      {sampleLeft && (
        <p className="mt-4 rounded-panel bg-bg-sunk px-4 py-3 text-[13px] leading-relaxed text-ink-2">
          仍标成【样例】的行是虚构数字。已经有原文数字的指标不再显示样例。
        </p>
      )}
      {points.length === 0 && <p className="mt-8 text-[14px] text-ink-4">还没有能核对的数字。</p>}

      {points.length > 0 && (
        <>
          <div className="mt-5 flex flex-wrap gap-3">
            <Select label="指标" value={metric} onChange={chooseMetric}>
              {metrics.map((item) => <option key={item} value={item}>{METRIC_LABELS[item] ?? item}</option>)}
            </Select>
            <Select label="细分" value={segment} onChange={chooseSegment}>
              {segments.map((item) => <option key={item}>{item}</option>)}
            </Select>
            <Select label="品牌" value={brand} onChange={setBrand}>
              <option value="">行业合计</option>
              {brands.map((item) => <option key={item}>{item}</option>)}
            </Select>
            {seriesUnits.length > 1 && (
              <Select label="单位" value={seriesUnit} onChange={setUnit}>
                {seriesUnits.map((item) => <option key={item}>{item}</option>)}
              </Select>
            )}
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-ink-4">
            解放和一汽解放、重汽和中国重汽这类别名合成一个品牌，原文用字留在格子里。东风汽车股份不并进东风商用车。折合数不是原文印出的整数。
          </p>

          <section id="annual" className="mt-8">
            <h2 className="text-[18px] font-semibold text-ink">年度</h2>
            <p className="mt-1 text-[13px] text-ink-3">
              {METRIC_LABELS[metric] ?? metric} · {segment}{brand ? ` · ${brand}` : ""}{seriesUnit ? ` · ${seriesUnit}` : ""}
              {annual.length > 0 ? ` · 已收录 ${annual.map((point) => point.period).join("、")}` : ""}
            </p>
            {annual.length >= 2 && <LineChart points={annual} />}
            {annual.length === 0 && <p className="mt-3 text-[13px] text-ink-4">这一组没有年度数字。更早的年份见文末缺口。</p>}
            {annual.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-line text-ink-4">
                      <th className="py-2 pr-3 font-medium">年份</th>
                      <th className="py-2 pr-3 font-medium">数值</th>
                      <th className="py-2 pr-3 font-medium">同比</th>
                      <th className="py-2 font-medium">来源</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annual.map((point) => (
                      <tr key={point.period} className="border-b border-line-soft">
                        <td className="py-2 pr-3 num">{point.period}</td>
                        <td className="py-2 pr-3 num">{published(point.value, point.unit)}{point.page ? ` · 第${point.page}页` : ""}</td>
                        <td className="py-2 pr-3 num">{formatChange(yoy.get(point.period) ?? null)}</td>
                        <td className="py-2"><a className="text-accent hover:underline" href={point.url} target="_blank" rel="noreferrer">{point.sourceName}</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!brand && <p className="mt-2 text-[12px] text-ink-4">2011–2019 年的行业年度序列还没有可复制的原文表，原因见文末。</p>}
          </section>

          <section id="ytd" className="mt-8">
            <h2 className="text-[18px] font-semibold text-ink">2026 年累计</h2>
            {ytd2026.basis === "none" ? (
              <p className="mt-2 text-[13px] text-ink-4">这一组没有 2026 年累计。单月到齐后会从 1 月起相加；在那之前只显示原文写明的累计。</p>
            ) : (
              <div className="mt-3 rounded-panel bg-bg-sunk px-4 py-3 text-[14px] leading-relaxed text-ink-2">
                <p>
                  {periodLabel(`2026-${String(ytd2026.endMonth).padStart(2, "0")}`, "ytd")} {METRIC_LABELS[metric] ?? metric}
                  {brand ? ` · ${brand}` : ""}：<span className="num font-semibold text-ink">{published(ytd2026.value ?? 0, ytd2026.unit)}</span>
                  。同比 {formatChange(ytdRatio)}。
                </p>
                <p className="mt-1 text-[13px]">
                  {ytd2026.basis === "cited" ? "这是原文写出的累计。" : "这是表内 1 月起连续各月相加，各月仍分别链到原文。"}
                  {" "}<a className="text-accent hover:underline" href={ytd2026.url} target="_blank" rel="noreferrer">{ytd2026.sourceName}</a>
                </p>
                {ytd2026.missingMonths.length > 0 && (
                  <p className="mt-1 text-[13px]">尚未入库的单月：{ytd2026.missingMonths.map((month) => `${month}月`).join("、")}。因此累计用的是原文合计数，不是把已有单月加总。</p>
                )}
                {ytd2026.openMonths.length > 0 && (
                  <p className="mt-1 text-[13px]">之后的 {ytd2026.openMonths.map((month) => `${month}月`).join("、")} 入库后，累计会接到更晚的月份；12 月到齐后即为全年。</p>
                )}
                {ytdRatio === null && <p className="mt-1 text-[13px]">没有截止到同一月份的 2025 年累计，所以同比留空。</p>}
              </div>
            )}
          </section>

          <section id="months" className="mt-8">
            <h2 className="text-[18px] font-semibold text-ink">2026 年单月</h2>
            {otherBrandUnit && <p className="mt-1 text-[12px] text-ink-4">企业排行还有以{otherBrandUnit}计的数字，可在下方切换单位。</p>}
            {months2026.length === 0 ? <p className="mt-2 text-[13px] text-ink-4">2026 年这一组还没有单月数字。1–5 月和 9 月见文末缺口。</p> : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-line text-ink-4">
                      <th className="py-2 pr-3 font-medium">月份</th>
                      <th className="py-2 pr-3 font-medium">品牌</th>
                      <th className="py-2 pr-3 font-medium">数值</th>
                      <th className="py-2 font-medium">来源</th>
                    </tr>
                  </thead>
                  <tbody>
                    {months2026.map((point) => (
                      <tr key={`${point.brand}-${point.period}-${point.url}`} className="border-b border-line-soft">
                        <td className="py-2 pr-3 num">{point.period}</td>
                        <td className="py-2 pr-3">{point.brand || "行业合计"}{point.brandText && point.brandText !== point.brand ? <span className="block text-[11px] text-ink-4">原文：{point.brandText.slice(0, 42)}</span> : null}</td>
                        <td className="py-2 pr-3 num">{published(point.value, point.unit)}</td>
                        <td className="py-2"><a className="text-accent hover:underline" href={point.url} target="_blank" rel="noreferrer">{point.sample ? "【样例】" : ""}{point.sourceName}</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section id="brands" className="mt-8">
            <h2 className="text-[18px] font-semibold text-ink">品牌排名与份额</h2>
            {rankUnits.length === 0 ? <p className="mt-2 text-[13px] text-ink-4">这一细分没有分品牌的数字。</p> : (
              <>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Select label="粒度" value={grain} onChange={(value) => { setRankGrain(value as Grain); setRankPeriod(""); }}>
                    {rankGrains.map((item) => <option key={item} value={item}>{GRAIN_LABEL[item]}</option>)}
                  </Select>
                  <Select label="期间" value={period} onChange={setRankPeriod}>
                    {rankPeriods.map((item) => <option key={item} value={item}>{periodLabel(item, grain)}</option>)}
                  </Select>
                  {!mixedRank && rankUnits.length > 1 && (
                    <Select label="单位" value={rankUnitValue} onChange={(value) => { setRankUnit(value); setRankPeriod(""); }}>
                      {rankUnits.map((item) => <option key={item}>{item}</option>)}
                    </Select>
                  )}
                </div>
                {ranking.rows.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {ranking.rows.map((row) => (
                      <div key={row.brand} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3 text-[13px]">
                        <span className="truncate text-ink">{row.brand}</span>
                        <span className="h-2 rounded-full bg-bg-sunk">
                          <span className="block h-2 rounded-full bg-accent" style={{ width: `${Math.max(2, row.listShare * 100)}%` }} />
                        </span>
                        <span className="num text-ink-2">{(row.listShare * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-[12px] text-ink-4">条形是这一榜内部的份额。{mixedRank ? "万辆和辆、万台和台按公布值乘以 10000 后排在一起，折合整数不是原文印出的数字。" : ""}{ranking.total ? "与行业合计折成同一单位时，表中另给出占公布总量的比例。" : "没有同单位的行业合计，所以不另算市场占比。"}</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-line text-ink-4">
                        <th className="py-2 pr-3 font-medium">品牌</th>
                        <th className="py-2 pr-3 font-medium">数值</th>
                        <th className="py-2 pr-3 font-medium">榜内份额</th>
                        <th className="py-2 pr-3 font-medium">占公布总量</th>
                        <th className="py-2 pr-3 font-medium">同比</th>
                        <th className="py-2 font-medium">来源</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.rows.map((row) => {
                        const priorPeriod = grain === "year" ? String(Number(period) - 1) : `${Number(period.slice(0, 4)) - 1}-${period.slice(5)}`;
                        const priors = rankPool.filter((point) => point.brand === row.brand && point.period === priorPeriod && point.grain === grain);
                        const currentNorm = normalizeUnit(row.value, row.unit);
                        const prior = priors.find((point) => point.unit === row.unit) ?? priors.find((point) => normalizeUnit(point.value, point.unit).unit === currentNorm.unit);
                        const priorNorm = prior ? normalizeUnit(prior.value, prior.unit) : null;
                        const ratio = priorNorm && priorNorm.unit === currentNorm.unit && priorNorm.value !== 0 ? (currentNorm.value - priorNorm.value) / priorNorm.value : null;
                        return (
                          <tr key={row.brand} className="border-b border-line-soft">
                            <td className="py-2 pr-3">{row.brand}{row.brandText && row.brandText !== row.brand ? <span className="block text-[11px] text-ink-4">原文：{row.brandText.slice(0, 42)}</span> : null}</td>
                            <td className="py-2 pr-3 num">{published(row.value, row.unit)}</td>
                            <td className="py-2 pr-3 num">{(row.listShare * 100).toFixed(1)}%</td>
                            <td className="py-2 pr-3 num">{row.totalShare === null ? "—" : `${(row.totalShare * 100).toFixed(1)}%`}</td>
                            <td className="py-2 pr-3 num">{formatChange(ratio)}</td>
                            <td className="py-2"><a className="text-accent hover:underline" href={row.url} target="_blank" rel="noreferrer">{row.sourceName}</a></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <section id="coverage" className="mt-8">
            <h2 className="text-[18px] font-semibold text-ink">覆盖</h2>
            <p className="mt-1 text-[13px] text-ink-3">每一格都是已入库的原文数字。品牌行和行业合计分行。</p>
            <div className="mt-3 max-h-[28rem] overflow-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
                <thead className="sticky top-0 bg-bg">
                  <tr className="border-b border-line text-ink-4">
                    <th className="py-2 pr-3 font-medium">指标</th>
                    <th className="py-2 pr-3 font-medium">细分</th>
                    <th className="py-2 pr-3 font-medium">品牌</th>
                    <th className="py-2 pr-3 font-medium">粒度</th>
                    <th className="py-2 pr-3 font-medium">期间</th>
                    <th className="py-2 font-medium">来源</th>
                  </tr>
                </thead>
                <tbody>
                  {coverage.map((line) => (
                    <tr key={`${line.metric}-${line.segment}-${line.brand}-${line.grain}-${line.unit}-${line.url}`} className="border-b border-line-soft">
                      <td className="py-2 pr-3">{METRIC_LABELS[line.metric] ?? line.metric}</td>
                      <td className="py-2 pr-3">{line.segment}</td>
                      <td className="py-2 pr-3">{line.brand || "行业合计"}</td>
                      <td className="py-2 pr-3">{GRAIN_LABEL[line.grain]} · {line.unit}</td>
                      <td className="py-2 pr-3 num">{line.periods.join("、")}</td>
                      <td className="py-2"><a className="text-accent hover:underline" href={line.url} target="_blank" rel="noreferrer">{line.sourceName}</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="gaps" className="mt-8">
            <h2 className="text-[18px] font-semibold text-ink">尚未收录</h2>
            <ul className="mt-3 space-y-3">
              {METRIC_GAPS.map((gap) => (
                <li key={gap.topic} className="text-[13px] leading-relaxed text-ink-2">
                  <span className="font-medium text-ink">{gap.topic}</span>
                  <span className="text-ink-3"> — {gap.why}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
