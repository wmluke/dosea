import type { Dataset, DatasetQuery } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { QueryForm } from "~/components/query-form";
import { saveQuery } from "~/models/query.server";
import { loadDataset } from "~/routes/workspace.$workspaceId.dataset.$datasetId";
import { loadQuery } from "~/routes/workspace.$workspaceId.dataset.$datasetId.explore.$queryId";

export async function loader({ params }: LoaderArgs) {
    const { workspaceId, datasetId, queryId, chartId } = params;
    const dataset = await loadDataset(datasetId, workspaceId);
    const query = await loadQuery({ queryId, datasetId });

    return json({ dataset, query, chartId });
}

export async function action({ params, request }: ActionArgs) {
    const { workspaceId, datasetId } = params;
    await loadDataset(datasetId, workspaceId);
    const form = await request.formData();
    const queryId = form.get("queryId") as string;
    const q = form.get("q") as string;
    if (!q) {
        throw Error("Missing field q");
    }
    const query = await saveQuery({
        id: queryId,
        query: q,
        datasetId: datasetId!
    });
    return redirect(`/workspace/${workspaceId}/dataset/${datasetId}/explore/${query.id}`);
}

export default function DatasetExplorePage() {
    const data = useLoaderData<typeof loader>();
    return (
        <>
            <h2 className="prose">Explore</h2>
            <QueryForm dataset={data.dataset as unknown as Dataset}
                       query={data.query as unknown as DatasetQuery}
                       showAddChartButton={!data.chartId} />

            <Outlet />
        </>
    );
}
