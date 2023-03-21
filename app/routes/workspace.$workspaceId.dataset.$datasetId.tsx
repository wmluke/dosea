import { Bars3Icon, CircleStackIcon } from "@heroicons/react/24/solid";
import type { Dataset } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { DatasetQueryNav } from "~/components/dataset-query-nav";
import { RightPane } from "~/components/right-pane";
import { SecondaryDrawer } from "~/components/secondary-drawer";
import { SectionDropdown } from "~/components/section-dropdown";
import { connect } from "~/lib/connector/connection.server";
import { getDatasetById } from "~/models/dataset.server";
import { useWorkspaceContext } from "~/routes/workspace.$workspaceId";
import { useQueryPageLoaderData } from "~/routes/workspace.$workspaceId.dataset.$datasetId.explore.$queryId";
import { badRequest, notFound, sanitizeConnectionUrl } from "~/utils";

export async function loadDataset(datasetId?: string, workspaceId?: string) {
    if (!datasetId) {
        throw notFound();
    }
    const dataset = await getDatasetById(datasetId as string);
    if (!dataset) {
        throw notFound();
    }
    if (workspaceId && dataset.workspaceId != workspaceId) {
        throw badRequest();
    }
    return dataset;
}

export async function loadDatasetTable(dataset: Dataset) {
    try {
        const db = await connect(dataset.connection, dataset.type);
        return db.getTables();
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function loader({ params }: LoaderArgs) {
    const { workspaceId, datasetId } = params;
    const dataset = await loadDataset(datasetId, workspaceId);
    const tables = await loadDatasetTable(dataset!);
    return json({ tables });
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);

    return (
        <>
            <div className="flex min-h-screen flex-1 flex-col items-center justify-center py-4">
                <h1>Sorry, something went wrong.</h1>
            </div>
            <Outlet />
        </>
    );
}

export default function DatasetPage() {
    const { tables } = useLoaderData<typeof loader>();

    const { workspace, dataset, query } = useWorkspaceContext();

    const queryLoaderData = useQueryPageLoaderData();

    return (
        <SecondaryDrawer
            drawerContent={
                <>
                    <div className="navbar bg-base-100 lg:hidden">
                        <div className="flex-none lg:hidden">
                            <label htmlFor="primary-drawer" className="btn-ghost btn-square btn">
                                <Bars3Icon className="inline-block h-6 w-6 stroke-current" />
                            </label>
                        </div>
                        <div className="mx-2 flex-1 px-2 text-3xl lg:hidden">{workspace?.name}</div>
                        <div className="flex-none">
                            <div className="flex-none lg:hidden">
                                <label htmlFor="secondary-drawer" className="btn-ghost btn-square btn">
                                    <Bars3Icon className="inline-block h-6 w-6 stroke-current" />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="mx-2 my-2 px-2 bg-base-100 bg-opacity-90">
                        <div className="m-0 p-0 flex flex-col justify-start gap-6 divide-y divide-neutral-800">
                            <section id="dataset-details" className="mx-0 px-0 mt-2">
                                <div className="flex justify-between mt-6">
                                    <h1 className="prose text-2xl flex gap-2 my-2">
                                        <CircleStackIcon className="h-[32px] w-[32px]"></CircleStackIcon>
                                        {dataset?.name}
                                    </h1>
                                    <SectionDropdown>
                                        <Link className="text-sm"
                                              to={["/workspace", dataset?.workspaceId, "dataset", dataset?.id, "edit"].join("/")}
                                              reloadDocument>
                                            Edit Dataset
                                        </Link>
                                        <Link className="text-sm"
                                              to={["/workspace", dataset?.workspaceId, "dataset", dataset?.id, "delete"].join("/")}
                                              reloadDocument>
                                            Delete Dataset
                                        </Link>
                                    </SectionDropdown>
                                </div>
                                <code className="mx-0 px-0">
                                    {dataset?.type} {sanitizeConnectionUrl(dataset?.connection)}
                                </code>
                            </section>
                            {!query ?
                                <section>
                                    <ul className="menu menu-compact">
                                        <DatasetQueryNav dataset={dataset} />
                                    </ul>
                                </section>
                                : ""
                            }
                            <Outlet context={{ workspace, dataset, query }} />
                        </div>
                    </div>
                </>
            }

            drawerSideContent={
                <div className="prose bg-base-200 px-4">
                    <RightPane
                        queryResult={queryLoaderData?.queryResult?.result}
                        queryError={queryLoaderData?.queryResult?.error}
                        tables={tables}
                    />
                </div>
            }
        />
    );
}
