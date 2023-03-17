import type { Dataset } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { useRouteLoaderData } from "react-router";
import { QueryResultsInspector } from "~/components/query-results-inspector";
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

export async function action({ params, request }: ActionArgs) {
    const { workspaceId, datasetId } = params;
    const dataset = await loadDataset(datasetId, workspaceId);

    const form = await request.formData();

    const query = form.get("query");
    if (!query) {
        throw "Invalid argument. Missing query.";
    }
    const db = await connect(dataset.connection, dataset.type);
    try {
        const queryResults = await db.query(query as string);
        return json({ queryResults, query });
    } finally {
        await db.close();
    }
}

export default function DatasetPage() {
    const { dataset } = useLoaderData<typeof loader>();

    const queryLoaderData = useRouteLoaderData(
        "routes/workspace.$workspaceId.dataset.$datasetId.explore.$queryId"
    ) as any;

    return (
        <div className="m-0 p-0">
            <section className="prose my-2">
                <h1 className="prose text-3xl">Dataset: {dataset.name}</h1>
                <code>
                    {dataset.type} {dataset.connection}
                </code>
            </section>

            <section className="my-6 flex justify-between gap-10">
                <div className="grow basis-4/5">
                    <Outlet />
                </div>
                <div className="prose grow-0 basis-1/5">
                    <h3 className="prose">Query Results</h3>
                    <QueryResultsInspector
                        className="w-[300px]"
                        result={queryLoaderData?.result}
                        error={queryLoaderData?.error}
                    />
                </div>
            </section>
        </div>
    );
}
