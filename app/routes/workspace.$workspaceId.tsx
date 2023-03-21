import { Bars3Icon } from "@heroicons/react/24/solid";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useRouteLoaderData } from "react-router";
import { LeftNav } from "~/components/left-nav";
import { RightPane } from "~/components/right-pane";
import type { Table } from "~/lib/connector/connection.server";
import type { DatasetWithQueries } from "~/models/dataset.server";
import { getDatasetById } from "~/models/dataset.server";
import type { WorkspaceWithDatasets } from "~/models/workspace.server";
import { getWorkspaceById } from "~/models/workspace.server";
import { loadDatasetTable } from "~/routes/workspace.$workspaceId.dataset.$datasetId";
import type { QueryPageLoaderReturn } from "~/routes/workspace.$workspaceId.dataset.$datasetId.explore.$queryId";
import { notFound } from "~/utils";

interface LoaderResponse {
    workspace: WorkspaceWithDatasets;
    dataset?: DatasetWithQueries | null;
    tables?: Table[];
}

export async function loader({ params }: LoaderArgs) {
    const { workspaceId, datasetId } = params;
    if (!workspaceId) {
        throw notFound();
    }
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace) {
        throw notFound();
    }
    const resp: LoaderResponse = { workspace };
    if (datasetId) {
        resp.dataset = await getDatasetById(datasetId);

        resp.tables = await loadDatasetTable(resp.dataset!);
    }
    return json(resp);
}

export default function WorkspacePage() {
    const { workspace, dataset, tables } = useLoaderData<typeof loader>() as LoaderResponse;

    // OMG!!! THIS IS HORRIBLE CODESMELL!!!!
    const queryPageLoaderData = useRouteLoaderData(
        "routes/workspace.$workspaceId.dataset.$datasetId.explore.$queryId"
    ) as QueryPageLoaderReturn;
    const chartsPageLoaderData = useRouteLoaderData(
        "routes/workspace.$workspaceId.dataset.$datasetId.explore.$queryId_.chart.$chartId"
    ) as QueryPageLoaderReturn;
    const queryLoaderData = queryPageLoaderData ?? chartsPageLoaderData;

    return (
        <div className="drawer-mobile drawer">
            <input id="main-drawer" type="checkbox" className="drawer-toggle" />
            <div
                className="drawer-content flex flex-col"
                style={{ scrollBehavior: "smooth", scrollPaddingTop: "5rem" }}
            >
                <div className="navbar bg-base-100 lg:hidden">
                    <div className="flex-none lg:hidden">
                        <label htmlFor="main-drawer" className="btn-ghost btn-square btn">
                            <Bars3Icon className="inline-block h-6 w-6 stroke-current" />
                        </label>
                    </div>
                    <div className="mx-2 flex-1 px-2 text-3xl lg:hidden">{workspace?.name}</div>
                    <div className="flex-none"></div>
                </div>
                <div className="mx-2 my-2 flex justify-between gap-10 bg-base-100 bg-opacity-90 px-2">
                    <div className="grow basis-4/5">
                        <Outlet></Outlet>
                    </div>
                    <div className="prose grow-0 basis-1/5 hidden sm:block">
                        <RightPane
                            queryResult={queryLoaderData?.queryResult?.result}
                            queryError={queryLoaderData?.queryResult?.error}
                            tables={tables}
                        />
                    </div>
                </div>
            </div>
            <div className="drawer-side" style={{ scrollBehavior: "smooth", scrollPaddingTop: "5rem" }}>
                <label htmlFor="main-drawer" className="drawer-overlay"></label>
                <LeftNav workspace={workspace} dataset={dataset} />
            </div>
        </div>
    );
}
