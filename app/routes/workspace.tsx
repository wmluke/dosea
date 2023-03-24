import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { LeftNav } from "~/components/left-nav";
import type { PanelMatch } from "~/components/page-layout";
import { PageLayout, usePageLayoutContext } from "~/components/page-layout";
import type { Table } from "~/lib/connector/connection.server";
import type { DatasetWithQueries } from "~/models/dataset.server";
import { getDatasetById } from "~/models/dataset.server";
import type { QueryWithDatasetAndCharts } from "~/models/query.server";
import { getQueryById } from "~/models/query.server";
import type { WorkspaceWithDatasets } from "~/models/workspace.server";
import { getWorkspaceById, getWorkspaces, saveWorkspace } from "~/models/workspace.server";
import { loadDatasetTable } from "~/routes/workspace.$workspaceId.dataset.$datasetId";
import { badRequest } from "~/utils";

export async function action({ request }: ActionArgs) {
    const formData = await request.formData();
    const [id, name] = [formData.get("id"), formData.get("name")] as Array<string | undefined>;
    if (!name) {
        throw badRequest();
    }
    const workspace = await saveWorkspace({ id, name });

    return redirect(`/workspace/${workspace.id}`);
}

export interface WorkspaceContext {
    workspace?: WorkspaceWithDatasets;
    dataset?: DatasetWithQueries | null;
    tables?: Table[];
    query?: QueryWithDatasetAndCharts;
}

export function useWorkspaceContext() {
    return usePageLayoutContext();
}

type LoaderContext = WorkspaceContext & { workspaces: WorkspaceWithDatasets[]; }

export async function loader({ params }: LoaderArgs) {
    const { workspaceId, datasetId, queryId } = params;

    const workspaces = await getWorkspaces();
    const context: LoaderContext = { workspaces };
    if (workspaceId) {
        context.workspace = await getWorkspaceById(workspaceId);
    }
    if (datasetId) {
        context.dataset = await getDatasetById(datasetId);
        context.tables = await loadDatasetTable(context.dataset!);
    }
    if (queryId) {
        context.query = await getQueryById(queryId);
    }
    return json(context);
}

export const handle: PanelMatch = {
    primaryDrawerOpen: true,
    primaryPanelItem({ workspace, dataset, match }) {
        const { workspaces = [] } = (match.data ?? { workspaces: [] }) as LoaderContext;
        return <LeftNav workspace={workspace} dataset={dataset}
                        workspaces={workspaces.filter(w => w?.id !== workspace?.id)} />;
    }
};


export default function WorkspacePage() {
    const { workspace, dataset, query, tables } = useLoaderData<typeof loader>() as WorkspaceContext;
    return (
        <PageLayout workspace={workspace} dataset={dataset} query={query} tables={tables}>
            <Outlet />
        </PageLayout>
    );
}
