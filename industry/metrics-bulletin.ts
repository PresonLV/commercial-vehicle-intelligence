// Monthly association tables. A row is kept only when the page states the unit and the month
// in the title matches the cumulative column. A mismatched header is not stored.

export interface BulletinRow {
  metric: "production" | "sales";
  segment: string;
  brand: string;
  period: string;
  grain: "month" | "year" | "ytd";
  value: number;
  unit: "万辆" | "万台" | "辆" | "台";
  confidence: "high" | "review";
  excerpt: string;
}

const TITLE_MONTH: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

const HEADER_MONTH: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const SEGMENT: Record<string, string> = {
  "Commercial Vehicles (CV)": "商用车",
  Buses: "客车",
  Trucks: "货车",
};

function plain(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** CAAM English monthly table. Unit: 10000 is stored as 万辆. Empty when the title month and the Jan.–X column disagree. */
export function parseCaamStatistics(html: string, metric: "production" | "sales"): BulletinRow[] {
  const text = plain(html);
  if (!/Unit:\s*10000/.test(text)) return [];
  const title = /in\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})/i.exec(text);
  const header = /Jan\.\s*[—–-]\s*([A-Za-z]+)/.exec(text);
  if (!title || !header) return [];
  const month = TITLE_MONTH[title[1]!.toLowerCase()];
  const headerMonth = HEADER_MONTH[header[1]!.slice(0, 3).toLowerCase()];
  const year = title[2]!;
  if (!month || !headerMonth || month !== headerMonth) return [];
  const period = `${year}-${String(month).padStart(2, "0")}`;
  const out: BulletinRow[] = [];
  for (const [label, segment] of Object.entries(SEGMENT)) {
    const found = new RegExp(`${label.replace(/[()]/g, "\\$&")}\\s+(-?\\d+(?:\\.\\d+)?)\\s+(-?\\d+(?:\\.\\d+)?)`).exec(text);
    if (!found) continue;
    const monthValue = Number(found[1]);
    const ytdValue = Number(found[2]);
    const excerpt = `Unit: 10000 ${label} ${found[1]} ${found[2]}`;
    out.push({ metric, segment, brand: "", period, grain: "month", value: monthValue, unit: "万辆", confidence: "high", excerpt });
    out.push({ metric, segment, brand: "", period, grain: "ytd", value: ytdValue, unit: "万辆", confidence: "high", excerpt });
    if (month === 12) out.push({ metric, segment, brand: "", period: year, grain: "year", value: ytdValue, unit: "万辆", confidence: "high", excerpt });
  }
  return out;
}

/** A 产销 sentence the table parser did not accept. Stored for an admin to check, not shown to readers. */
export function reviewBulletin(text: string): BulletinRow[] {
  if (!/产销/.test(text)) return [];
  const ym = /(20\d{2})\s*年\s*(\d{1,2})\s*月/.exec(text);
  const figure = /(\d+(?:\.\d+)?)\s*(万辆|万台|辆|台)/.exec(text);
  if (!ym || !figure) return [];
  const month = Number(ym[2]);
  if (month < 1 || month > 12) return [];
  return [{
    metric: "sales",
    segment: "",
    brand: "",
    period: `${ym[1]}-${String(month).padStart(2, "0")}`,
    grain: "month",
    value: Number(figure[1]),
    unit: figure[2] as BulletinRow["unit"],
    confidence: "review",
    excerpt: figure[0],
  }];
}
