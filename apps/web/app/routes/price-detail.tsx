import { QUOTE_GAPS } from "@aihot/industry/quote-gaps";
import { groupQuotes, quoteId, visibleQuotes, type QuoteViewPoint } from "@aihot/industry/quote-view";
import { data as withHeaders, Link, useLoaderData } from "react-router";
import type { Route } from "./+types/price-detail";
import { apiGet } from "../lib/api.server";
import { pageMeta } from "../lib/seo";

export async function loader({ request }: Route.LoaderArgs) {
  const body = await apiGet<{ points: QuoteViewPoint[] }>("/api/site/quotes", { signal: request.signal });
  return withHeaders(body, { headers: { "Cache-Control": "public, max-age=60" } });
}

export function meta({ params }: Route.MetaArgs) {
  return pageMeta({ title: "卡车报价", description: "一款车的指导价、配置和历次记录。", path: `/prices/${params.id}` });
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

function wan(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 万元`;
}

function Trend({ points }: { points: QuoteViewPoint[] }) {
  if (points.length < 2) return <p className="mt-2 text-[13px] text-ink-4">还只有一次记录。再抓到另一个日期才会画出走势。</p>;
  const width = 360;
  const height = 96;
  const pad = 16;
  const min = Math.min(...points.map((point) => point.priceWan));
  const max = Math.max(...points.map((point) => point.priceWan));
  const span = max - min || 1;
  const coords = points.map((point, index) => {
    const x = pad + (index * (width - pad * 2)) / (points.length - 1);
    const y = height - pad - ((point.priceWan - min) / span) * (height - pad * 2);
    return { x, y, point };
  });
  const path = coords.map((dot, index) => `${index === 0 ? "M" : "L"}${dot.x.toFixed(1)},${dot.y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-28 w-full max-w-lg text-accent" role="img" aria-label="指导价记录">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
      {coords.map((dot) => <circle key={dot.point.observedOn} cx={dot.x} cy={dot.y} r="3" fill="currentColor" />)}
    </svg>
  );
}

export default function PriceDetail({ params }: Route.ComponentProps) {
  const loaded = useLoaderData<typeof loader>();
  const model = groupQuotes(visibleQuotes(loaded.points ?? [])).find((item) => item.id === params.id || quoteId(item.url) === params.id);
  if (!model) {
    return (
      <div className="pb-8">
        <h1 className="pt-4 text-[24px] font-semibold text-ink lg:pt-0">没有这款车</h1>
        <p className="mt-3 text-[14px] text-ink-3">公开报价里没有这个配置。<Link className="text-accent hover:underline" to="/prices">返回卡车报价</Link></p>
      </div>
    );
  }
  const msrpHistory = model.history.filter((point) => point.kind === "msrp");
  const fields: Array<[string, string]> = [
    ["品牌", model.brand || "—"],
    ["车系", model.series || "—"],
    ["细分", model.segment || "—"],
    ["驱动", model.drive || "—"],
    ["发动机", model.engineBrand || "—"],
    ["马力", model.horsepower ? String(model.horsepower) : "—"],
    ["变速箱", model.gearbox || "—"],
    ["燃料", model.powerType || "—"],
    ["排放", model.emission || "—"],
    ["厂商指导价", wan(model.msrp?.priceWan)],
    ["指导价记录日", model.msrp?.observedOn ?? "—"],
    ["指导价公布日", model.msrp?.priceDate ?? "—"],
    ["经销商报价", wan(model.dealer?.priceWan)],
    ["经销商记录日", model.dealer?.observedOn ?? "—"],
  ];
  return (
    <div className="pb-8">
      <p className="pt-4 text-[13px] lg:pt-0"><Link className="text-accent hover:underline" to="/prices">卡车报价</Link></p>
      <h1 className="mt-2 text-[24px] font-semibold leading-snug text-ink">{model.sample ? "【样例】" : ""}{model.modelName}</h1>
      <p className="mt-2 text-[13px] text-ink-3">
        <a className="text-accent hover:underline" href={model.url} target="_blank" rel="noreferrer">{model.sample ? "【样例】" : ""}{model.sourceName}</a>
      </p>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="border-b border-line-soft pb-2">
            <dt className="text-[12px] text-ink-4">{label}</dt>
            <dd className="mt-0.5 text-[14px] text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <section className="mt-8">
        <h2 className="text-[18px] font-semibold text-ink">指导价记录</h2>
        <Trend points={msrpHistory} />
        <ul className="mt-3 space-y-2">
          {msrpHistory.map((point) => (
            <li key={`${point.observedOn}-${point.kind}`} className="text-[13px] text-ink-2">
              <span className="num">{point.observedOn}</span> 记录 {wan(point.priceWan)}
              {point.priceDate ? `，公布日 ${point.priceDate}` : "，页上没有公布日"}
              {" "}
              <a className="text-accent hover:underline" href={point.url} target="_blank" rel="noreferrer">原文</a>
            </li>
          ))}
          {msrpHistory.length === 0 && <li className="text-[13px] text-ink-4">这一款没有厂商指导价。</li>}
        </ul>
      </section>
      <p className="mt-8 text-[12px] leading-relaxed text-ink-4">{QUOTE_GAPS.find((gap) => gap.topic.startsWith("同一配置"))?.why}</p>
    </div>
  );
}
