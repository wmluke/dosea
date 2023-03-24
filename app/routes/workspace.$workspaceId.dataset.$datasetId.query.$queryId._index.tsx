import { ChartPieIcon } from "@heroicons/react/24/solid";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { ChartsGrid } from "~/components/charts-grid";
import { SectionDropdown } from "~/components/section-dropdown";
import { loadQuery, runQuery } from "~/lib/query.cache";

export async function loader({ params }: LoaderArgs) {
    const { datasetId, queryId } = params;
    const query = await loadQuery({ queryId, datasetId });
    const queryResult = await runQuery({ queryId, datasetId }) as any;
    return json({ query, queryResult });
}

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
