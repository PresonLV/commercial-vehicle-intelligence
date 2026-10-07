import { useState, type ChangeEvent } from "react";
import type { Route } from "./+types/metrics";
import { useAdminAction } from "../../features/admin/action";
import { AdminPage, Button, Card, Field } from "../../features/admin/ui";
import { adminGet } from "../../lib/admin.server";

interface MetricRow {
  id: string;
  metric: string;
  segment: string;
  brand: string;
  period: string;
  value: number;
  unit: string;
  source_name: string;
  url: string;
  sample: boolean;
  grain: "month" | "year" | "ytd";
  method: string;
  confidence: string;
}

export async function loader({ request }: Route.LoaderArgs) {
  return adminGet<{ metrics: Record<string, string>; rows: MetricRow[] }>(request, "/api/admin/metrics");
}

const EMPTY = { metric: "sales", segment: "", brand: "", period: "", grain: "month", value: "", unit: "辆", sourceName: "", url: "", reason: "" };
const GRAIN_LABEL: Record<string, string> = { month: "单月", year: "年度", ytd: "累计" };

export default function AdminMetrics({ loaderData }: Route.ComponentProps) {
  const { run, busy } = useAdminAction();
  const [form, setForm] = useState(EMPTY);
  const [csv, setCsv] = useState("metric,segment,brand,period,value,unit,source_name,url\n");
  const [csvReason, setCsvReason] = useState("");
  const set = (key: keyof typeof EMPTY) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: event.target.value });
  return (
    <AdminPage title="数据录入" subtitle="自动抽不到的产量、销量、上牌量和交强险在这里补。公开页只显示已核对的行，样例数字仍会标明。">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="手工添加">
          <form className="grid gap-3" onSubmit={(event) => {
            event.preventDefault();
            void run("POST", "/api/admin/metrics", { ...form, value: Number(form.value) }, { success: "已写入", label: "add-metric" });
          }}>
            <Field label="指标">
              <select className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.metric} onChange={set("metric")}>
                {Object.entries(loaderData.metrics).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="细分"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.segment} onChange={set("segment")} placeholder="重卡" /></Field>
              <Field label="品牌"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.brand} onChange={set("brand")} placeholder="可空" /></Field>
              <Field label="粒度">
                <select className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.grain} onChange={set("grain")}>
                  <option value="month">单月</option>
                  <option value="year">年度</option>
                  <option value="ytd">累计到该月</option>
                </select>
              </Field>
              <Field label="期间"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.period} onChange={set("period")} placeholder={form.grain === "year" ? "2025" : "2026-08"} /></Field>
              <Field label="数值"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.value} onChange={set("value")} /></Field>
              <Field label="单位">
                <select className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.unit} onChange={set("unit")}>
                  {["万辆", "万台", "辆", "台"].map((unit) => <option key={unit}>{unit}</option>)}
                </select>
              </Field>
              <Field label="来源"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.sourceName} onChange={set("sourceName")} /></Field>
            </div>
            <Field label="原文链接"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.url} onChange={set("url")} /></Field>
            <Field label="原因"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={form.reason} onChange={set("reason")} /></Field>
            <Button type="submit" tone="primary" busy={busy}>写入</Button>
          </form>
        </Card>
        <Card title="CSV 导入">
          <form className="grid gap-3" onSubmit={(event) => {
            event.preventDefault();
            void run("POST", "/api/admin/metrics/import", { csv, reason: csvReason }, { success: "已导入", label: "import-metrics" });
          }}>
            <Field label="表头固定" hint="可加 grain：month、year 或 ytd。不加时按单月。">
              <textarea className="min-h-40 w-full rounded-control bg-bg p-2 font-mono text-[12px] ring-1 ring-line" value={csv} onChange={(event) => setCsv(event.target.value)} />
            </Field>
            <Field label="原因"><input className="h-9 w-full rounded-control bg-bg px-2 text-[13px] ring-1 ring-line" value={csvReason} onChange={(event) => setCsvReason(event.target.value)} /></Field>
            <Button type="submit" tone="primary" busy={busy}>导入</Button>
          </form>
        </Card>
      </div>
      <Card title="已入库" className="mt-4" pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[13px]">
            <thead className="text-ink-4">
              <tr>{["期间", "指标", "细分", "品牌", "数值", "来源", "状态", ""].map((label) => <th key={label} className="px-3 py-2 font-medium">{label}</th>)}</tr>
            </thead>
            <tbody>
              {loaderData.rows.map((row) => (
                <tr key={row.id} className="border-t border-line-soft">
                  <td className="px-3 py-2 num">{row.period} {GRAIN_LABEL[row.grain] ?? ""}</td>
                  <td className="px-3 py-2">{loaderData.metrics[row.metric] ?? row.metric}</td>
                  <td className="px-3 py-2">{row.segment}</td>
                  <td className="px-3 py-2">{row.brand}</td>
                  <td className="px-3 py-2 num">{row.value} {row.unit}</td>
                  <td className="px-3 py-2"><a className="text-accent hover:underline" href={row.url}>{row.sample ? "【样例】" : ""}{row.source_name}</a></td>
                  <td className="px-3 py-2">{row.confidence === "review" ? "待核对" : row.method === "manual" ? "人工" : row.method === "table" ? "表格" : "正文"}</td>
                  <td className="px-3 py-2">
                    {row.confidence === "review" && (
                      <Button size="sm" onClick={() => {
                        const reason = window.prompt("核对原因");
                        if (reason) void run("POST", `/api/admin/metrics/${row.id}/approve`, { reason }, { success: "已公开", label: `approve-${row.id}` });
                      }}>公开</Button>
                    )}
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
