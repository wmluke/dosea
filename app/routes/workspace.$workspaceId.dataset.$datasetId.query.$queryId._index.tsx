import { ChartPieIcon } from "@heroicons/react/24/solid";
import { Link } from "@remix-run/react";
import { ChartsGrid } from "~/components/chart/charts-grid";
import { SectionDropdown } from "~/components/section-dropdown";
import { useWorkspaceContext } from "~/routes/workspace";

export default function QueryIndexPage() {
    const { query, queryResult, dataset } = useWorkspaceContext();
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
            <ChartsGrid charts={query?.charts ?? []} queryResult={queryResult?.result}
                        datasetType={dataset?.type} />
        </section>
    );
}
