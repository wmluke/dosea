import { CircleStackIcon } from "@heroicons/react/24/solid";
import type { Dataset } from "@prisma/client";
import { Link, Outlet } from "@remix-run/react";
import type { PanelMatch } from "~/components/page-layout";
import { SectionDropdown } from "~/components/section-dropdown";
import { connect } from "~/lib/connector/connection.server";
import { getDatasetById } from "~/models/dataset.server";
import { useWorkspaceContext } from "~/routes/workspace";
import { badRequest, notFound, sanitizeConnectionUrl } from "~/utils";

export async function loadDataset(datasetId?: string, workspaceId?: string) {
    if (!datasetId) {
        throw badRequest("datasetId is required");
    }
    const dataset = await getDatasetById(datasetId as string);
    if (!dataset) {
        throw notFound("Dataset");
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

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);

    return (
        <>
            <div className="flex min-h-screen flex-1 flex-col items-center justify-center py-4">
                <h1>Sorry, something went wrong.</h1>
            </div>
        </>
    );
}

export const handle: PanelMatch = {
    primaryDrawerOpen: true
};

export default function DatasetPage() {
    const { dataset } = useWorkspaceContext();

    return (
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
                <Outlet />
            </div>
        </div>
    );
}
