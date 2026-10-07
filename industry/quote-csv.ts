// Admin CSV for a price the page did not extract. The header is required.
import type { QuoteKind } from "./quote-parse.ts";

export interface ManualQuoteRow {
  brand: string;
  series: string;
  modelName: string;
  segment: string;
  drive: string;
  engineBrand: string;
  horsepower: number | null;
  gearbox: string;
  powerType: string;
  emission: string;
  kind: QuoteKind;
  priceWan: number;
  priceDate: string | null;
  observedOn: string;
  sourceName: string;
  url: string;
}

export const QUOTE_CSV_HEADER = [
  "brand", "series", "model_name", "segment", "drive", "engine_brand", "horsepower", "gearbox", "power_type", "emission", "kind", "price_wan", "price_date", "observed_on", "source_name", "url",
] as const;

const KINDS = new Set(["msrp", "dealer"]);

export function parseQuoteCsv(csv: string): { rows: ManualQuoteRow[]; errors: string[] } {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return { rows: [], errors: ["CSV 是空的"] };
  const header = splitCsv(lines[0]!).map((cell) => cell.trim());
  if (header.join(",") !== QUOTE_CSV_HEADER.join(",")) return { rows: [], errors: [`表头必须是 ${QUOTE_CSV_HEADER.join(",")}`] };
  const rows: ManualQuoteRow[] = [];
  const errors: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsv(lines[i]!).map((cell) => cell.trim());
    if (cells.length !== header.length) {
      errors.push(`第 ${i + 1} 行列数不对`);
      continue;
    }
    const [brand, series, modelName, segment, drive, engineBrand, horsepower, gearbox, powerType, emission, kind, priceWan, priceDate, observedOn, sourceName, url] = cells;
    const price = Number(priceWan);
    const hp = horsepower ? Number(horsepower) : null;
    if (!brand || !modelName || !segment) errors.push(`第 ${i + 1} 行缺少品牌、配置或细分`);
    else if (!KINDS.has(kind ?? "")) errors.push(`第 ${i + 1} 行种类必须是 msrp 或 dealer`);
    else if (!Number.isFinite(price) || price <= 0) errors.push(`第 ${i + 1} 行价格必须是大于 0 的万元数`);
    else if (hp != null && (!Number.isFinite(hp) || hp <= 0)) errors.push(`第 ${i + 1} 行马力无效`);
    else if (priceDate && !/^\d{4}-\d{2}-\d{2}$/.test(priceDate)) errors.push(`第 ${i + 1} 行报价日期要写成 YYYY-MM-DD，没有就留空`);
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(observedOn ?? "")) errors.push(`第 ${i + 1} 行记录日要写成 YYYY-MM-DD`);
    else if (!sourceName) errors.push(`第 ${i + 1} 行缺少来源名称`);
    else if (!/^https?:\/\//.test(url ?? "")) errors.push(`第 ${i + 1} 行需要原文链接`);
    else rows.push({
      brand: brand!, series: series ?? "", modelName: modelName!, segment: segment!, drive: drive ?? "", engineBrand: engineBrand ?? "",
      horsepower: hp, gearbox: gearbox ?? "", powerType: powerType ?? "", emission: emission ?? "", kind: kind as QuoteKind,
      priceWan: price, priceDate: priceDate || null, observedOn: observedOn!, sourceName: sourceName!, url: url!,
    });
  }
  return { rows, errors };
}

function splitCsv(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (quoted && ch === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
    } else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      cells.push(cur);
      cur = "";
    } else cur += ch;
  }
  cells.push(cur);
  return cells;
}
