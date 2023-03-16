import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { Suspense } from "react";
import { useRouteLoaderData } from "react-router";
import { ChartEditor } from "~/components/chart.editor";
import { Loading } from "~/components/loading";
import { getChartConfigById, saveChartConfig } from "~/models/chartconfig.server";
import type { QueryResults } from "~/routes/workspace.$workspaceId.dataset.$datasetId.explore.$queryId";
import { loadQuery } from "~/routes/workspace.$workspaceId.dataset.$datasetId.explore.$queryId";
import { badRequest, notFound } from "~/utils";

export async function loader({ params, request }: LoaderArgs) {
    const { queryId, chartId } = params;
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
    return json({ chartConfig });
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
        type: "echart",
    });
    return redirect(`/workspace/${workspaceId}/dataset/${datasetId}/explore/${queryId}`);
}

export default function () {
    const { chartConfig } = useLoaderData<typeof loader>();

    const { result, query } = useRouteLoaderData(
        "routes/workspace.$workspaceId.dataset.$datasetId.explore.$queryId"
    ) as QueryResults;

    return (
        <div className="mx-8 w-full">
            <Suspense fallback={<Loading />}>
                <ChartEditor
                    data={result}
                    queryId={query.id}
                    chartId={chartConfig.id}
                    config={JSON.parse(chartConfig.configJson)}
                />
            </Suspense>
        </div>
    );
}
