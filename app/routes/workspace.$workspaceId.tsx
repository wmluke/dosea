import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";
import { LeftNav } from "~/components/left-nav";
import { PrimaryDrawer } from "~/components/primary-drawer";
import type { DatasetWithQueries } from "~/models/dataset.server";
import { getDatasetById } from "~/models/dataset.server";
import type { QueryWithDatasetAndCharts } from "~/models/query.server";
import { getQueryById } from "~/models/query.server";
import type { WorkspaceWithDatasets } from "~/models/workspace.server";
import { getWorkspaceById } from "~/models/workspace.server";
import { notFound } from "~/utils";

export interface WorkspaceContext {
    workspace: WorkspaceWithDatasets;
    dataset?: DatasetWithQueries | null;
    query?: QueryWithDatasetAndCharts;
}

export async function loader({ params }: LoaderArgs) {
    const { workspaceId, datasetId, queryId } = params;
    if (!workspaceId) {
        throw notFound();
    }
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace) {
        throw notFound();
    }
    const context: WorkspaceContext = { workspace };
    if (datasetId) {
        context.dataset = await getDatasetById(datasetId);
    }
    if (queryId) {
        context.query = await getQueryById(queryId);
    }
    return json(context);
}

export default function WorkspacePage() {
    const { workspace, dataset, query } = useLoaderData<typeof loader>() as WorkspaceContext;

    return (
        <PrimaryDrawer
            drawerSideContent={
                <LeftNav key="LeftNav" workspace={workspace} dataset={dataset} />
            }
            drawerContent={
                <Outlet key="WorkspacePageOutlet" context={{ workspace, dataset, query }} />
            } />
    );
}

export function useWorkspaceContext() {
    return useOutletContext<WorkspaceContext>();
}
