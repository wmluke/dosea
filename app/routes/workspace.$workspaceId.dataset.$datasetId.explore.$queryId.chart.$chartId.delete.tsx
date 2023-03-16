import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteChartConfig, getChartConfigById } from "~/models/chartconfig.server";
import { joinTruthy, notFound } from "~/utils";

export async function loader({ params }: LoaderArgs) {
    const { workspaceId, datasetId, queryId, chartId } = params;
    if (!chartId) {
        throw notFound();
    }
    const chartConfig = await getChartConfigById(chartId);
    if (!chartConfig) {
        throw notFound();
    }
    await deleteChartConfig(chartConfig.id);

    return redirect(joinTruthy(["/workspace", workspaceId, "dataset", datasetId, "explore", queryId], "/"));
}
