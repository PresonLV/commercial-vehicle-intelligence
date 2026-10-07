import { useState, type ChangeEvent } from "react";
import type { Route } from "./+types/quotes";
import { useAdminAction } from "../../features/admin/action";
import { AdminPage, Button, Card, Field } from "../../features/admin/ui";
import { adminGet } from "../../lib/admin.server";

interface QuoteRow {
  id: string;
  brand: string;
  series: string;
  model_name: string;
  segment: string;
  kind: string;
  price_wan: number;
  observed_on: string;
  source_name: string;
  url: string;
  sample: boolean;
  method: string;
  confidence: string;
}

const EMPTY = {
  brand: "", series: "", modelName: "", segment: "重卡牵引车", drive: "", engineBrand: "", horsepower: "", gearbox: "",
  powerType: "柴油", emission: "", kind: "msrp", priceWan: "", priceDate: "", observedOn: "", sourceName: "", url: "", reason: "",
};

export async function loader({ request }: Route.LoaderArgs) {
  return adminGet<{ header: string; rows: QuoteRow[] }>(request, "/api/admin/quotes");
}

export default function AdminQuotes({ loaderData }: Route.ComponentProps) {
  const { run, busy } = useAdminAction();
  const [form, setForm] = useState(EMPTY);
  const [csv, setCsv] = useState(`${loaderData.header}\n`);
  const [csvReason, setCsvReason] = useState("");
  const set = (key: keyof typeof EMPTY) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: event.target.value });
  const review = loaderData.rows.filter((row) => row.confidence !== "high");
  return (
    <AdminPage title="卡车报价" subtitle="自动抽不到的指导价和经销商报价在这里补。公开页只显示已核对的行，样例价格仍会标明。">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="手工添加">
          <form className="grid gap-3" onSubmit={(event) => {
            event.preventDefault();
            void run("POST", "/api/admin/quotes", { ...form, horsepower: form.horsepower ? Number(form.horsepower) : null, priceWan: Number(form.priceWan), priceDate: form.priceDate || null }, { success: "已写入", label: "add-quote" });
          }}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="品牌"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.brand} onChange={set("brand")} /></Field>
              <Field label="车系"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.series} onChange={set("series")} /></Field>
            </div>
            <Field label="配置"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.modelName} onChange={set("modelName")} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="细分"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.segment} onChange={set("segment")} /></Field>
              <Field label="种类">
                <select className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.kind} onChange={set("kind")}>
                  <option value="msrp">厂商指导价</option>
                  <option value="dealer">经销商报价</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="价格（万元）"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.priceWan} onChange={set("priceWan")} /></Field>
              <Field label="记录日"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.observedOn} onChange={set("observedOn")} placeholder="2026-10-07" /></Field>
            </div>
            <Field label="来源"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.sourceName} onChange={set("sourceName")} /></Field>
            <Field label="链接"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.url} onChange={set("url")} /></Field>
            <Field label="原因"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.reason} onChange={set("reason")} /></Field>
            <Button type="submit" tone="primary" busy={busy}>写入</Button>
          </form>
        </Card>
        <Card title="CSV">
          <form className="grid gap-3" onSubmit={(event) => {
            event.preventDefault();
            void run("POST", "/api/admin/quotes/import", { csv, reason: csvReason }, { success: "已导入", label: "import-quotes" });
          }}>
            <textarea className="min-h-40 w-full rounded-control bg-bg p-2 font-mono text-[12px] ring-1 ring-line" value={csv} onChange={(event) => setCsv(event.target.value)} />
            <Field label="原因"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={csvReason} onChange={(event) => setCsvReason(event.target.value)} /></Field>
            <Button type="submit" tone="primary" busy={busy}>导入</Button>
          </form>
        </Card>
      </div>
      <Card title={review.length ? `待核对 ${review.length}` : "最近写入"} className="mt-4" pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-ink-4"><tr><th className="px-3 py-2">配置</th><th>价格</th><th>状态</th><th></th></tr></thead>
            <tbody>
              {loaderData.rows.map((row) => (
                <tr key={row.id} className="border-t border-line-soft">
                  <td className="px-3 py-2">{row.sample ? "【样例】" : ""}{row.brand} {row.model_name}</td>
                  <td className="num">{row.price_wan} 万元</td>
                  <td>{row.confidence === "high" ? "公开" : "待核对"}</td>
                  <td className="px-3 py-2">
                    {row.confidence !== "high" && (
                      <Button size="sm" busy={busy} onClick={() => {
                        const reason = window.prompt("核对原因");
                        if (reason) void run("POST", `/api/admin/quotes/${row.id}/approve`, { reason }, { success: "已公开", label: `approve-quote-${row.id}` });
                      }}>公开</Button>
                    )}
                    <a className="ml-2 text-accent hover:underline" href={row.url}>{row.source_name}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminPage>
  );
}
