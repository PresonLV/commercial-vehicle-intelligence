// Weekly price check. Readers never call this. With COLLECT_ENABLED=false it does not open the network.
import { QUOTE_FETCH_PAUSE_MS, QUOTE_FETCH_PRODUCT_CAP, QUOTE_LISTINGS } from "@aihot/industry/quote-sources";
import { listPriceWorthOpening, parseChinatruckList, parseChinatruckProduct } from "@aihot/industry/quote-parse";
import { sql } from "../db.ts";

const SOURCE = "卡车网";
const UA = "cvhot-research admin@example.com";

export interface QuoteRefreshResult {
  skipped: boolean;
  inserted: number;
  review: number;
}

function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function insertObserved(input: {
  brand: string; series: string; modelName: string; segment: string; drive: string; engineBrand: string;
  horsepower: number | null; gearbox: string; powerType: string; emission: string; kind: "msrp" | "dealer";
  priceWan: number; literal: string; url: string; confidence: "high" | "review"; observedOn: string;
}): Promise<boolean> {
  const label = input.kind === "msrp" ? "厂商指导价" : "经销商报价";
  const saved = await sql<{ id: string }[]>`
    INSERT INTO truck_quotes (
      brand, series, model_name, segment, drive, engine_brand, horsepower, gearbox, power_type, emission,
      kind, price_wan, price_date, observed_on, source_name, url, excerpt, confidence, method, sample
    ) VALUES (
      ${input.brand}, ${input.series}, ${input.modelName}, ${input.segment}, ${input.drive}, ${input.engineBrand}, ${input.horsepower},
      ${input.gearbox}, ${input.powerType}, ${input.emission}, ${input.kind}, ${input.priceWan}, ${null}, ${input.observedOn},
      ${SOURCE}, ${input.url}, ${`${input.modelName}；${label}：${input.literal}`}, ${input.confidence}, 'fetch', false
    )
    ON CONFLICT (url, kind, observed_on) DO NOTHING
    RETURNING id`;
  return Boolean(saved);
}

export async function refreshTruckQuotes(fetchPage: typeof fetch = fetch): Promise<QuoteRefreshResult> {
  if (process.env.COLLECT_ENABLED === "false") return { skipped: true, inserted: 0, review: 0 };
  const observedOn = today();
  const products: string[] = [];
  const seen = new Set<string>();
  for (const listing of QUOTE_LISTINGS) {
    if (products.length >= QUOTE_FETCH_PRODUCT_CAP) break;
    await pause(QUOTE_FETCH_PAUSE_MS);
    const response = await fetchPage(listing.url, { headers: { "user-agent": UA, accept: "text/html" } });
    if (!response.ok) continue;
    const html = await response.text();
    for (const row of parseChinatruckList(html)) {
      if (!listPriceWorthOpening(row.priceText) || seen.has(row.url)) continue;
      seen.add(row.url);
      products.push(row.url);
      if (products.length >= QUOTE_FETCH_PRODUCT_CAP) break;
    }
  }
  let inserted = 0;
  let review = 0;
  for (const url of products) {
    await pause(QUOTE_FETCH_PAUSE_MS);
    const response = await fetchPage(url, { headers: { "user-agent": UA, accept: "text/html" } });
    if (!response.ok) continue;
    const parsed = parseChinatruckProduct(await response.text());
    if (!parsed || (parsed.msrpWan == null && parsed.dealerWan == null)) continue;
    const base = {
      brand: parsed.brand, series: parsed.series, modelName: parsed.modelName, segment: parsed.segment || "未标细分",
      drive: parsed.drive, engineBrand: parsed.engineBrand, horsepower: parsed.horsepower, gearbox: parsed.gearbox,
      powerType: parsed.powerType, emission: parsed.emission, url, observedOn,
    };
    const level = (literal: string) => (/\d+(?:\.\d+)?\s*万元$/.test(literal) && parsed.brand && parsed.segment ? "high" as const : "review" as const);
    if (parsed.msrpWan != null && parsed.msrpLiteral) {
      const confidence = level(parsed.msrpLiteral);
      const wrote = await insertObserved({ ...base, kind: "msrp", priceWan: parsed.msrpWan, literal: parsed.msrpLiteral, confidence });
      if (wrote && confidence === "high") inserted += 1;
      if (wrote && confidence === "review") review += 1;
    }
    if (parsed.dealerWan != null && parsed.dealerLiteral) {
      const confidence = level(parsed.dealerLiteral);
      const wrote = await insertObserved({ ...base, kind: "dealer", priceWan: parsed.dealerWan, literal: parsed.dealerLiteral, confidence });
      if (wrote && confidence === "high") inserted += 1;
      if (wrote && confidence === "review") review += 1;
    }
  }
  return { skipped: false, inserted, review };
}
