// Site navigation, one place for the desktop sidebar, the mobile tab bar and the mobile "更多" page.
import { NAV } from "@aihot/industry/site";
import { FEATURES } from "@aihot/industry/features";
import type { ReactNode } from "react";
import {
  IconApps, IconBolt, IconBookmark, IconChart, IconDoc, IconFlame, IconGrid, IconHeart, IconHistory, IconList, IconMessage, IconPlug,
} from "../icons";

export interface NavItem {
  to: string;
  label: string;
  icon: (p: { size?: number }) => ReactNode;
  /** Match the path exactly (the home page). */
  end?: boolean;
  /** Shows the unread dot while the changelog has news. */
  changelog?: boolean;
}

export const SIDEBAR: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "内容",
    items: [
      { to: "/", label: NAV.selected, icon: IconBolt, end: true },
      { to: "/all", label: NAV.all, icon: IconList },
      { to: "/hot", label: NAV.hot, icon: IconFlame },
      { to: "/daily", label: NAV.daily, icon: IconDoc },
      { to: "/topics", label: NAV.topics, icon: IconGrid },
      ...(FEATURES.readerBookmarks ? [{ to: "/starred", label: "收藏", icon: IconBookmark }] : []),
      { to: "/data", label: "数据", icon: IconChart },
      { to: "/research", label: "深度研究", icon: IconChart },
    ],
  },
  // The optional AI-only modules (industry/features.ts).
  ...(FEATURES.leaderboard || FEATURES.codexResetMonitor
    ? [
        {
          title: "模型",
          items: [
            ...(FEATURES.leaderboard ? [{ to: "/leaderboard", label: "模型榜", icon: IconChart }] : []),
            ...(FEATURES.codexResetMonitor ? [{ to: "/codex-reset", label: "Tibo重置监控", icon: IconHistory }] : []),
          ],
        },
      ]
    : []),
  {
    title: "更多",
    items: [
      { to: "/agent", label: "Agent 接入", icon: IconPlug },
      { to: "/about", label: "关于", icon: IconHeart },
      { to: "/feedback", label: "反馈", icon: IconMessage },
    ],
  },
];

export const TABBAR: NavItem[] = [
  { to: "/", label: NAV.selected, icon: IconBolt, end: true },
  { to: "/all", label: NAV.all, icon: IconList },
  { to: "/daily", label: NAV.daily, icon: IconDoc },
  { to: "/more", label: "更多", icon: IconApps },
];

/** Pages reached from the mobile "更多" tab keep that tab highlighted. */
export const MORE_PATHS = ["/more", "/hot", "/data", "/research", "/topics", "/leaderboard", "/codex-reset", "/agent", "/about", "/feedback", "/terms", "/privacy", ...(FEATURES.readerBookmarks ? ["/starred"] : [])];

export function tabIsActive(item: NavItem, pathname: string): boolean {
  if (item.end) return pathname === item.to;
  if (item.to === "/more") return MORE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (item.to === "/daily") return /^\/(daily|weekly|monthly)(\/|$)/.test(pathname);
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}
