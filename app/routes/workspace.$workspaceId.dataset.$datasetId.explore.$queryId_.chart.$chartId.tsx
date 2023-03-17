import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { ChartEditor } from "~/components/chart-editor";
import { getChartConfigById, saveChartConfig } from "~/models/chartconfig.server";
import { loadQuery, runQuery } from "~/routes/workspace.$workspaceId.dataset.$datasetId.explore.$queryId";
import { badRequest, notFound } from "~/utils";

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
    const queryResult = await runQuery(query);

    return json({ chartConfig, query, queryResult });
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
    return redirect(`/workspace/${workspaceId}/dataset/${datasetId}/explore/${queryId}`);
}

export default function ChartEditorPage() {
    const data = useLoaderData<typeof loader>();

    return (
        <div className="w-full overflow-hidden">
            <ChartEditor
                className="mx-8 w-full"
                data={data.queryResult?.result ?? []}
                queryId={data.query?.id!}
                chartId={data.chartConfig.id}
                config={JSON.parse(data.chartConfig.configJson)}
            />
        </div>
    );
}
