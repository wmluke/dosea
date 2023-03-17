import { CircleStackIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { DatasetQueryNav } from "~/components/dataset-query-nav";
import { DatasetSchema } from "~/components/dataset-schema";
import type { Table } from "~/lib/connector/sqlite";
import type { DatasetWithQueries } from "~/models/dataset.server";
import { getDatasetById } from "~/models/dataset.server";
import type { WorkspaceWithDatasets } from "~/models/workspace.server";
import { getWorkspaceById } from "~/models/workspace.server";
import { loadDatasetTable } from "~/routes/workspace.$workspaceId.dataset.$datasetId";
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

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

export default function WorkspacePage() {
    const { workspace, dataset, tables } = useLoaderData<typeof loader>();

    return (
        <div className="drawer-mobile drawer">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div
                className="drawer-content flex flex-col"
                style={{ scrollBehavior: "smooth", scrollPaddingTop: "5rem" }}
            >
                <div className="navbar bg-base-100 lg:hidden">
                    <div className="flex-none lg:hidden">
                        <label htmlFor="my-drawer-2" className="btn-ghost btn-square btn">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="inline-block h-6 w-6 stroke-current"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                ></path>
                            </svg>
                        </label>
                    </div>
                    <div className="mx-2 flex-1 px-2 text-3xl lg:hidden">{workspace?.name}</div>
                    <div className="flex-none"></div>
                </div>
                <div className="mx-2 my-2 bg-base-100 bg-opacity-90 px-2">
                    <Outlet></Outlet>
                </div>
            </div>
            <div className="drawer-side" style={{ scrollBehavior: "smooth", scrollPaddingTop: "5rem" }}>
                <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
                <ul className="menu menu menu-compact flex w-80 flex-col bg-base-200 p-0 px-4 text-base-content">
                    <li>
                        <div className="mx-2 flex-1 px-2 text-3xl">{workspace?.name}</div>
                    </li>
                    <li className="menu-title flex flex-row flex-nowrap">
                        <span className="text-xl">Datasets</span>
                        <Link className="btn-xs btn-circle btn" to={`/workspace/${workspace?.id}/dataset/add`}>
                            <PlusCircleIcon className="h-6 w-6"></PlusCircleIcon>
                        </Link>
                    </li>
                    {workspace?.datasets.map((ds) => {
                        return (
                            <li key={ds.id}>
                                <NavLink
                                    reloadDocument
                                    to={`/workspace/${workspace.id}/dataset/${ds.id}/explore`}
                                    className={({ isActive }) => classNames(isActive ? "active" : "", "gap")}
                                >
                                    <CircleStackIcon className="h-6 w-6"></CircleStackIcon>
                                    {ds.name}
                                </NavLink>
                            </li>
                        );
                    })}
                    {/*@ts-ignore*/}
                    <DatasetQueryNav dataset={dataset} />
                    <DatasetSchema tables={tables} />
                </ul>
            </div>
        </div>
    );
}
