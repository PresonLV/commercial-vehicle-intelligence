import { data } from "react-router";

/** 更新日志只在后台。公开地址不再打开。 */
export function loader() {
  throw data({ message: "not_found" }, { status: 404 });
}

export function headers() {
  return { "Cache-Control": "private, no-store" };
}

export default function ChangelogClosed() {
  return null;
}
