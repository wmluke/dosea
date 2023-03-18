import { CircleStackIcon } from "@heroicons/react/24/solid";
import type { Dataset } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { SectionDropdown } from "~/components/section-dropdown";
import { connect } from "~/lib/connector/sqlite";
import { getDatasetById } from "~/models/dataset.server";
import { badRequest, notFound } from "~/utils";

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
    const db = await connect(dataset.connection, dataset.type);
    try {
        return db.getTables();
    } finally {
        await db.close();
    }
}

export async function loader({ params }: LoaderArgs) {
    const { workspaceId, datasetId } = params;
    const dataset = await loadDataset(datasetId, workspaceId);
    return json({ dataset });
}

export default function DatasetPage() {
    const { dataset } = useLoaderData<typeof loader>();

    return (
        <div className="m-0 p-0 flex flex-col justify-start gap-6 divide-y divide-neutral-800">
            <section id="dataset-details" className="mx-0 px-0 mt-2">
                <div className="flex justify-between mt-6">
                    <h1 className="prose text-2xl flex gap-2 my-2">
                        <CircleStackIcon className="h-[32px] w-[32px]"></CircleStackIcon>
                        {dataset.name}
                    </h1>
                    <SectionDropdown>
                        <Link className="text-sm"
                              to={["/workspace", dataset.workspaceId, "dataset", dataset.id, "edit"].join("/")}
                              reloadDocument>
                            Edit Dataset
                        </Link>
                        <Link className="text-sm"
                              to={["/workspace", dataset.workspaceId, "dataset", dataset.id, "delete"].join("/")}
                              reloadDocument>
                            Delete Dataset
                        </Link>
                    </SectionDropdown>
                </div>
                <code className="mx-0 px-0">
                    {dataset.type} {dataset.connection}
                </code>
            </section>

            <Outlet />
        </div>
    );
}
