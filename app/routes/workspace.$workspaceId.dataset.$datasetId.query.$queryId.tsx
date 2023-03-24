import { ChartPieIcon } from "@heroicons/react/24/solid";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { ChartsGrid } from "~/components/charts-grid";
import type { PanelMatch } from "~/components/page-layout";
import { RightPane } from "~/components/right-pane";
import { SectionDropdown } from "~/components/section-dropdown";
import type { QueryError } from "~/lib/query.cache";
import { loadQuery, runQuery } from "~/lib/query.cache";
import type { QueryWithDatasetAndCharts } from "~/models/query.server";

export interface QueryPageLoaderReturn<T = Array<Record<string, any>>> {
    query: QueryWithDatasetAndCharts;
    queryResult: {
        result?: T;
        error?: QueryError;
    };
}

export async function loader({ params }: LoaderArgs) {
    const { datasetId, queryId } = params;
    const query = await loadQuery({ queryId, datasetId });
    const queryResult = await runQuery({ queryId, datasetId }) as any;
    return json({ query, queryResult });
}

export const handle: PanelMatch = {
    secondaryPanelItem({ match, tables }) {
        const { queryResult } = match.data as QueryPageLoaderReturn;
        return (
            <div className="prose">
                <RightPane queryResult={queryResult.result} queryError={queryResult.error} tables={tables} />
            </div>
        );
    }
};

export default function QueryPage() {
    const data = useLoaderData<typeof loader>();
    const query = data.query;
    const addChartUrl = [
        "/workspace",
        query?.dataset.workspaceId,
        "dataset",
        query?.datasetId,
        "query",
        query?.id,
        "chart/add"
    ].join("/");
    return (
        <section id="charts-grid" className="w-full overflow-hidden">
            <div className="flex justify-between mt-6">
                <h3 className="prose text-xl flex gap-2">
                    <ChartPieIcon className="w-7 h-7" />
                    Charts
                </h3>
                <SectionDropdown>
                    <Link className="text-sm"
                          to={addChartUrl}
                          reloadDocument>
                        Add Chart
                    </Link>
                </SectionDropdown>
            </div>
            <ChartsGrid charts={query?.charts ?? []} queryResult={data.queryResult?.result} />
        </section>
    );
}

export function useQueryPageLoaderData(): QueryPageLoaderReturn {
    return useRouteLoaderData("routes/workspace.$workspaceId.dataset.$datasetId.query.$queryId") as QueryPageLoaderReturn;
}
