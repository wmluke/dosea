import type { Dataset } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
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
        <div className="m-0 p-0">
            <section className="prose my-2">
                <h1 className="prose text-3xl">Dataset: {dataset.name}</h1>
                <code>
                    {dataset.type} {dataset.connection}
                </code>
            </section>

            <section className="my-6">
                <Outlet />
            </section>
        </div>
    );
}
