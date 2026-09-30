import { ENTITIES, TRACKED_COMPANIES } from "@aihot/industry/taxonomy";
import { data as withHeaders, Link, useLoaderData } from "react-router";
import type { Route } from "./+types/research";
import type { TimelineResponse } from "@aihot/contracts/site";
import { loadOr404, queryString, releaseBoundCache } from "../lib/api.server";
import { pageMeta } from "../lib/seo";
import { Timeline } from "../features/feed/Timeline";

const GROUPS = [
  { key: "benchmark", label: "海外对标" },
  { key: "fleet", label: "国内车队" },
  { key: "ecosystem", label: "新业态公司" },
] as const;

export async function loader({ request }: Route.LoaderArgs) {
  const upstream = new Headers();
  const data = await loadOr404<TimelineResponse>(`/api/site/timeline${queryString({ category: "research" })}`, { responseHeaders: upstream, signal: request.signal });
  return withHeaders({ data }, { headers: releaseBoundCache(data.refreshAt, 60, Date.now(), upstream) });
}

export function meta() {
  return pageMeta({
    title: "深度研究",
    description: "投资者日、年报战略和车队、后市场长案例。短新闻仍在原来的栏目。",
    path: "/research",
  });
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export default function ResearchPage() {
  const { data } = useLoaderData<typeof loader>();
  return (
    <div className="pb-6">
      <h1 className="pt-4 text-[24px] font-semibold leading-[1.3] text-ink lg:pt-0">深度研究</h1>
      <p className="mt-2 max-w-[42rem] text-[14px] leading-relaxed text-ink-3">
        投资者日、年报战略和把一种商业模式讲透的长案例。短新闻仍在上游、中游、下游和海外市场。国内案例的最后一段是模式要点与可借鉴之处。
      </p>
      <div className="mt-4">
        <Link to="/all?tag=新业态" className="inline-flex rounded-full border border-line px-3 py-1 text-[13px] font-medium text-ink transition-colors hover:bg-bg-sunk">
          新业态
        </Link>
      </div>
      <div className="mt-5 space-y-4">
        {GROUPS.map((group) => (
          <div key={group.key}>
            <div className="mb-2 text-[12px] font-semibold text-ink-4">{group.label}</div>
            <div className="flex flex-wrap gap-2">
              {TRACKED_COMPANIES.filter((company) => company.group === group.key).map((company) => (
                <Link key={company.id} to={`/topics/${company.slug}`} className="rounded-full bg-bg-sunk px-3 py-1 text-[13px] text-ink-2 transition-colors hover:text-accent">
                  {ENTITIES[company.id]?.name ?? company.id}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Timeline initial={data} filters={data.filters} />
      </div>
    </div>
  );
}
