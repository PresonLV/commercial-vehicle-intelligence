/** 政策文件上能从标题里读出的文号。读不出就不编。 */
const DOC_NO = /([^\s()（）【】]{2,24}[〔\[]\d{4}[〕\]]\s*\d{1,6}\s*号)/;

export interface PolicyNotice {
  issuer: string;
  docNo: string | null;
  date: string | null;
}

/** 发文机关用来源名，文号只取标题里写明的，日期按北京时间的发布日。 */
export function policyNotice(title: string, sourceName: string, publishedAt: string | null): PolicyNotice {
  const issuer = sourceName.split(/[·|]/)[0]?.trim() || sourceName.trim();
  const docNo = DOC_NO.exec(title)?.[1]?.replace(/\s+/g, "") ?? null;
  return { issuer, docNo, date: beijingDate(publishedAt) };
}

function beijingDate(publishedAt: string | null): string | null {
  if (!publishedAt) return null;
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return publishedAt.slice(0, 10);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function policyNoticeLine(title: string, sourceName: string, publishedAt: string | null): string {
  const notice = policyNotice(title, sourceName, publishedAt);
  return [notice.issuer, notice.docNo, notice.date].filter(Boolean).join(" · ");
}
