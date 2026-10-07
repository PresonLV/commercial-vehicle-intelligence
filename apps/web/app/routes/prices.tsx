import { useMemo, useState, type ReactNode } from "react";
import { QUOTE_GAPS } from "@aihot/industry/quote-gaps";
import {
  applyQuoteFilter, groupByBrandSeries, groupQuotes, shownPrice, visibleQuotes,
  type QuoteFilter, type QuoteModel, type QuoteViewPoint,
} from "@aihot/industry/quote-view";
import { data as withHeaders, Link, useLoaderData } from "react-router";
import type { Route } from "./+types/prices";
import { apiGet } from "../lib/api.server";
import { pageMeta } from "../lib/seo";

export async function loader({ request }: Route.LoaderArgs) {
  const body = await apiGet<{ points: QuoteViewPoint[] }>("/api/site/quotes", { signal: request.signal });
  return withHeaders(body, { headers: { "Cache-Control": "public, max-age=60" } });
}

export function meta() {
  return pageMeta({
    title: "卡车报价",
    description: "主流卡车配置的厂商指导价。每个价格链到写出它的车型页。没有写明的价格留空。",
    path: "/prices",
  });
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

function wan(value: number | null): string {
  if (value == null) return "—";
  return `${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 万元`;
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-[12px] text-ink-4">
      {label}
      <select className="h-9 min-w-32 rounded-control bg-bg px-2 text-[13px] text-ink ring-1 ring-line" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-[12px] text-ink-4">
      {label}
      <input className="h-9 w-24 rounded-control bg-bg px-2 text-[13px] text-ink ring-1 ring-line" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function num(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const EMPTY: QuoteFilter = { segment: "", brand: "", power: "", hpMin: null, hpMax: null, priceMin: null, priceMax: null, sort: "brand" };

export default function PricesPage() {
  const loaded = useLoaderData<typeof loader>();
  const models = useMemo(() => groupQuotes(visibleQuotes(loaded.points ?? [])), [loaded.points]);
  const sampleLeft = models.some((model) => model.sample);
  const segments = [...new Set(models.map((model) => model.segment).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh"));
  const brands = [...new Set(models.map((model) => model.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh"));
  const powers = [...new Set(models.map((model) => model.powerType).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh"));
  const [segment, setSegment] = useState("");
  const [brand, setBrand] = useState("");
  const [power, setPower] = useState("");
  const [hpMin, setHpMin] = useState("");
  const [hpMax, setHpMax] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState<QuoteFilter["sort"]>("brand");
  const filter: QuoteFilter = { ...EMPTY, segment, brand, power, hpMin: num(hpMin), hpMax: num(hpMax), priceMin: num(priceMin), priceMax: num(priceMax), sort };
  const shown = applyQuoteFilter(models, filter);
  const groups = sort === "brand" ? groupByBrandSeries(shown) : [{ brand: "", series: "", models: shown }];

  return (
    <div className="pb-8">
      <h1 className="pt-4 text-[24px] font-semibold leading-[1.3] text-ink lg:pt-0">卡车报价</h1>
      <p className="mt-2 max-w-[42rem] text-[14px] leading-relaxed text-ink-3">
        按品牌和车系排列主流配置。厂商指导价和经销商报价分开写。价格只保留车型页上印出的数字，并链回该页。页上没有的项显示为 —。
      </p>
      {sampleLeft && (
        <p className="mt-4 rounded-panel bg-bg-sunk px-4 py-3 text-[13px] leading-relaxed text-ink-2">
          标成【样例】的行是虚构价格。已经有原文价格时，样例不再显示。
        </p>
      )}
      {models.length === 0 && <p className="mt-8 text-[14px] text-ink-4">还没有核对过的报价。</p>}
      {models.length > 0 && (
        <>
          <div className="mt-5 flex flex-wrap gap-3">
            <Select label="细分" value={segment} onChange={setSegment}>
              <option value="">全部</option>
              <option value="新能源">新能源</option>
              {segments.map((item) => <option key={item}>{item}</option>)}
            </Select>
            <Select label="品牌" value={brand} onChange={setBrand}>
              <option value="">全部</option>
              {brands.map((item) => <option key={item}>{item}</option>)}
            </Select>
            <Select label="燃料" value={power} onChange={setPower}>
              <option value="">全部</option>
              {powers.map((item) => <option key={item}>{item}</option>)}
            </Select>
            <NumberField label="马力起" value={hpMin} onChange={setHpMin} />
            <NumberField label="马力止" value={hpMax} onChange={setHpMax} />
            <NumberField label="价格起（万元）" value={priceMin} onChange={setPriceMin} />
            <NumberField label="价格止（万元）" value={priceMax} onChange={setPriceMax} />
            <Select label="排序" value={sort} onChange={(value) => setSort(value as QuoteFilter["sort"])}>
              <option value="brand">品牌 / 车系</option>
              <option value="price-asc">指导价从低到高</option>
              <option value="price-desc">指导价从高到低</option>
            </Select>
          </div>
          <p className="mt-3 text-[12px] text-ink-4">当前 {shown.length} 款。新能源筛的是换电、纯电、氢燃料和 LNG。</p>
          {shown.length === 0 && <p className="mt-8 text-[14px] text-ink-4">这个筛选下没有报价。</p>}
          <div className="mt-6 space-y-8">
            {groups.map((group) => (
              <section key={`${group.brand}-${group.series}-${group.models[0]?.id}`}>
                {sort === "brand" && (
                  <h2 className="text-[18px] font-semibold text-ink">{group.brand || "未标品牌"}{group.series ? ` · ${group.series}` : ""}</h2>
                )}
                <ul className="mt-3 divide-y divide-line-soft border-y border-line-soft">
                  {group.models.map((model) => <ModelRow key={model.id} model={model} />)}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
      <section className="mt-10">
        <h2 className="text-[18px] font-semibold text-ink">还没有的报价</h2>
        <ul className="mt-3 space-y-3">
          {QUOTE_GAPS.map((gap) => (
            <li key={gap.topic} className="text-[13px] leading-relaxed text-ink-3">
              <span className="font-medium text-ink-2">{gap.topic}。</span>{gap.why}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ModelRow({ model }: { model: QuoteModel }) {
  return (
    <li className="py-3">
      <Link to={`/prices/${model.id}`} className="block hover:text-accent">
        <div className="text-[15px] font-medium leading-snug text-ink">{model.sample ? "【样例】" : ""}{model.modelName}</div>
      </Link>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-4">
        {[model.segment, model.drive, model.engineBrand, model.horsepower ? `${model.horsepower} 马力` : "", model.gearbox, model.powerType, model.emission].filter(Boolean).join(" · ") || "—"}
      </p>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
        <span>厂商指导价 <span className="num text-ink">{wan(model.msrp?.priceWan ?? null)}</span></span>
        <span>经销商报价 <span className="num text-ink">{wan(model.dealer?.priceWan ?? null)}</span></span>
        <a className="text-accent hover:underline" href={model.url} target="_blank" rel="noreferrer">{model.sample ? "【样例】" : ""}{model.sourceName}</a>
      </div>
    </li>
  );
}
