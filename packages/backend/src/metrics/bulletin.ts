// Once a month the worker reads association pages and company 产销快报.
// Readers never call this. With COLLECT_ENABLED=false it does not open the network.
import { spawn } from "node:child_process";
import { Agent, fetch as undiciFetch } from "undici";
import { canonicalBrand } from "@aihot/industry/metric-alias";
import { extractFigures } from "@aihot/industry/metrics";
import { parseCaamStatistics, reviewBulletin, type BulletinRow } from "@aihot/industry/metrics-bulletin";
import { sql } from "../db.ts";

// The English CAAM certificate is expired. Only that host skips verification; tests pass their own fetch.
const caamAgent = new Agent({ connect: { rejectUnauthorized: false } });

const CAAM = [
  { metric: "sales" as const, url: "https://en.caam.org.cn/Index/lists/catid/16.html" },
  { metric: "production" as const, url: "https://en.caam.org.cn/Index/lists/catid/15.html" },
];

const STOCKS: Array<[code: string, column: string, org: string, name: string]> = [
  ["000800", "szse", "gssz0000800", "一汽解放"],
  ["000951", "szse", "gssz0000951", "中国重汽"],
  ["000550", "szse", "gssz0000550", "江铃"],
  ["000338", "szse", "9900002961", "潍柴"],
  ["000903", "szse", "gssz0000903", "云内动力"],
  ["000880", "szse", "gssz0000880", "潍柴重机"],
  ["000957", "szse", "gssz0000957", "中通客车"],
  ["600166", "sse", "gssh0600166", "福田"],
  ["600418", "sse", "gssh0600418", "江淮"],
  ["600066", "sse", "gssh0600066", "宇通"],
  ["600686", "sse", "gssh0600686", "金龙"],
  ["600218", "sse", "gssh0600218", "全柴"],
  ["600841", "sse", "gssh0600841", "上柴"],
  ["600006", "sse", "gssh0600006", "东风汽车股份"],
];

async function insertRow(row: BulletinRow, sourceName: string, url: string): Promise<"inserted" | "skipped"> {
  const brand = canonicalBrand(row.brand);
  const saved = await sql<{ id: string }[]>`
    INSERT INTO metric_points (metric, segment, brand, brand_text, period, grain, value, unit, source_name, url, page, article_id, sample, method, confidence)
    VALUES (${row.metric}, ${row.segment}, ${brand}, ${row.brand}, ${row.period}, ${row.grain}, ${row.value}, ${row.unit}, ${sourceName}, ${url}, '', NULL, false, ${row.confidence === "review" ? "bulletin" : "table"}, ${row.confidence})
    ON CONFLICT (metric, segment, brand, period, grain, url) DO NOTHING
    RETURNING id`;
  return saved.length ? "inserted" : "skipped";
}

function textFromPdf(bytes: Buffer): Promise<string> {
  return new Promise((resolve) => {
    const child = spawn("pdftotext", ["-layout", "-", "-"]);
    const chunks: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    child.on("error", () => resolve(""));
    child.on("close", () => resolve(Buffer.concat(chunks).toString("utf8")));
    child.stdin.write(bytes);
    child.stdin.end();
  });
}

async function textOfPdf(url: string, fetchImpl: typeof fetch): Promise<string> {
  const response = await fetchImpl(url, { headers: { "User-Agent": "cvhot-metrics" } });
  if (!response.ok) return "";
  return textFromPdf(Buffer.from(await response.arrayBuffer()));
}

async function cninfoPdfs(fetchImpl: typeof fetch): Promise<Array<{ name: string; url: string; title: string }>> {
  const found: Array<{ name: string; url: string; title: string }> = [];
  for (const [code, column, org, name] of STOCKS) {
    try {
      const body = new URLSearchParams({
        pageNum: "1", pageSize: "5", column, tabName: "fulltext", plate: "",
        stock: `${code},${org}`, searchkey: "产销", secid: "", category: "", trade: "",
        seDate: "", sortName: "", sortType: "", isHLtitle: "true",
      });
      const response = await fetchImpl("https://www.cninfo.com.cn/new/hisAnnouncement/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Referer: "https://www.cninfo.com.cn/",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent": "cvhot-metrics",
        },
        body,
      });
      if (!response.ok) continue;
      const data = await response.json() as { announcements?: Array<{ announcementTitle?: string; adjunctUrl?: string }> };
      for (const item of data.announcements ?? []) {
        const title = item.announcementTitle ?? "";
        if (!title.includes("产销") || title.includes("摘要") || !item.adjunctUrl) continue;
        found.push({ name, title, url: `http://static.cninfo.com.cn/${item.adjunctUrl}` });
      }
    } catch {
      continue;
    }
  }
  return found;
}

async function readText(url: string, fetchImpl: typeof fetch): Promise<string | null> {
  try {
    const response = url.startsWith("https://en.caam.org.cn/") && fetchImpl === fetch
      ? await undiciFetch(url, { headers: { "User-Agent": "cvhot-metrics" }, dispatcher: caamAgent })
      : await fetchImpl(url, { headers: { "User-Agent": "cvhot-metrics" } });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

export async function appendMonthlyBulletins(fetchImpl: typeof fetch = fetch): Promise<{ skipped: boolean; inserted: number; review: number }> {
  if (process.env.COLLECT_ENABLED === "false") return { skipped: true, inserted: 0, review: 0 };
  let inserted = 0;
  let review = 0;
  const accept = async (rows: BulletinRow[], sourceName: string, url: string) => {
    for (const row of rows) {
      const outcome = await insertRow(row, sourceName, url);
      if (outcome !== "inserted") continue;
      if (row.confidence === "review") review += 1;
      else inserted += 1;
    }
  };
  for (const page of CAAM) {
    const html = await readText(page.url, fetchImpl);
    if (!html) continue;
    const links = [...html.matchAll(/href="(\/Index\/show\/catid\/\d+\/id\/\d+\.html)"/g)].map((match) => new URL(match[1]!, page.url).href);
    for (const link of links.slice(0, 3)) {
      const body = await readText(link, fetchImpl);
      if (body) await accept(parseCaamStatistics(body, page.metric), "中国汽车工业协会", link);
    }
  }
  const engineHtml = await readText("https://ciceia.org.cn/", fetchImpl);
  if (engineHtml) {
    const links = [...engineHtml.matchAll(/href="(https?:\/\/ciceia\.org\.cn\/xinwendongtai\/\d+\.html|\/xinwendongtai\/\d+\.html)"/g)]
      .map((match) => new URL(match[1]!, "https://ciceia.org.cn").href)
      .slice(0, 3);
    for (const link of links) {
      const text = await readText(link, fetchImpl);
      if (!text) continue;
      const plain = text.replace(/<[^>]+>/g, " ");
      const parsed = extractFigures(plain).filter((point) => point.metric === "production" || point.metric === "sales");
      if (parsed.length) {
        await accept(parsed.map((point) => ({
          metric: point.metric as "production" | "sales",
          segment: point.segment,
          brand: point.brand,
          period: point.period,
          grain: "month" as const,
          value: point.value,
          unit: point.unit as BulletinRow["unit"],
          confidence: "high" as const,
          excerpt: "",
        })), "中国内燃机工业协会", link);
      } else await accept(reviewBulletin(plain), "中国内燃机工业协会", link);
    }
  }
  for (const filing of await cninfoPdfs(fetchImpl)) {
    let text = "";
    try {
      text = await textOfPdf(filing.url, fetchImpl);
    } catch {
      text = "";
    }
    const parsed = extractFigures(text).filter((point) => point.metric === "production" || point.metric === "sales");
    if (parsed.length) {
      await accept(parsed.map((point) => ({
        metric: point.metric as "production" | "sales",
        segment: point.segment,
        brand: filing.name,
        period: point.period,
        grain: "month" as const,
        value: point.value,
        unit: point.unit as BulletinRow["unit"],
        confidence: "high" as const,
        excerpt: "",
      })), `${filing.name}产销快报`, filing.url);
    } else await accept(reviewBulletin(text), `${filing.name}产销快报`, filing.url);
  }
  return { skipped: false, inserted, review };
}
