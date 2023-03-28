import { ChartPieIcon } from "@heroicons/react/24/solid";
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { ChartEditor } from "~/components/chart-editor";
import { loadQuery, runQuery } from "~/lib/query.cache";
import type { ChartWithQuery } from "~/models/chartconfig.server";
import { getChartConfigById, saveChartConfig } from "~/models/chartconfig.server";
import type { QueryWithDatasetAndCharts } from "~/models/query.server";
import { useWorkspaceContext } from "~/routes/workspace";
import type { QueryPageLoaderReturn } from "~/routes/workspace.$workspaceId.dataset.$datasetId.query.$queryId";
import { badRequest, notFound } from "~/utils";


export interface ChartPageLoaderReturn extends QueryPageLoaderReturn {
    chartConfig: ChartWithQuery;
    query: QueryWithDatasetAndCharts;
}

export async function loader({ params }: LoaderArgs) {
    const { datasetId, queryId, chartId } = params;
    if (!chartId) {
        throw notFound();
    }
    if (chartId === "add") {
        const chartConfig = { id: chartId, configJson: "{}" };
        return json({ chartConfig });
    }
    const chartConfig = await getChartConfigById(chartId);
    if (!chartConfig) {
        throw notFound();
    }
    if (chartConfig.queryId !== queryId) {
        throw badRequest();
    }

    const query = await loadQuery({ queryId, datasetId });
    const queryResult = await runQuery({ queryId, datasetId }) as any;

    const returnValue: ChartPageLoaderReturn = { chartConfig, query, queryResult };
    return json(returnValue);
}

export async function action({ params, request }: ActionArgs) {
    const { workspaceId, datasetId, queryId, chartId } = params;

    await loadQuery({ queryId, datasetId });

    const formData = await request.formData();
    const configJson = formData.get("configJson") as string;
    if (!configJson) {
        throw badRequest();
    }

    await saveChartConfig({
        id: chartId === "add" ? undefined : chartId,
        configJson,
        queryId: queryId as string,
        type: "echart"
    });
    return redirect(`/workspace/${workspaceId}/dataset/${datasetId}/query/${queryId}`);
}

function parseConfigJson(json?: string | null) {
    try {
        return json ? JSON.parse(json) : undefined;
    } catch (e) {
        console.warn("!!! Failed to parse Chart.configJson");
        console.warn(e);
        return;
    }
}

export default function ChartEditorPage() {
    const data = useLoaderData<typeof loader>() as ChartPageLoaderReturn;
    const { dataset } = useWorkspaceContext();
    const json = data.chartConfig?.configJson ?? undefined;
    const config = parseConfigJson(json);
    return (
        <section id="chart-editor" className="w-full overflow-hidden">
            <h3 className="prose text-xl flex gap-2 mt-6">
                <ChartPieIcon className="w-7 h-7" />
                Chart Editor
            </h3>
            <ChartEditor
                className="w-full"
                data={data.queryResult?.result ?? []}
                queryId={data.query?.id!}
                chartId={data.chartConfig?.id}
                config={config}
                datasetType={dataset?.type}
            />
        </section>
    );
}
