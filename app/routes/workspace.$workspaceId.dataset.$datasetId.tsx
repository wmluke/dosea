import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { DatasetSchema } from "~/components/datasetSchema";
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
    if (dataset.workspaceId != workspaceId) {
        throw badRequest();
    }
    return dataset;
}

export async function loader({ params }: LoaderArgs) {
    const { workspaceId, datasetId } = params;
    const dataset = await loadDataset(datasetId, workspaceId);

    const db = await connect(dataset.connection, dataset.type);
    try {
        const tables = await db.getTables();
        return json({ dataset, tables });
    } finally {
        await db.close();
    }
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

function truncate(str: string, n: number) {
    return str.length > n ? str.slice(0, n - 1) + " ..." : str;
}

export default function DatasetPage() {
    const { dataset, tables } = useLoaderData<typeof loader>();

    return (
        <div className="m-0 p-0">
            <section className="prose my-2">
                <h1 className="prose text-3xl">Dataset: {dataset.name}</h1>
                <code>
                    {dataset.type} {dataset.connection}
                </code>
            </section>

            <section className="my-6 flex justify-between gap-10">
                <div className="basis-3/4">
                    <Outlet />
                </div>
                <div className="prose basis-1/4">
                    <h2>Queries</h2>
                    <ul className="prose">
                        {dataset.queries.map((q) => {
                            return (
                                <li key={q.id}>
                                    <Link to={`explore/${q.id}`} reloadDocument={true} className="no-underline">
                                        <code className="p-0">{truncate(q.query, 40)}</code>
                                    </Link>
                                </li>
                            );
                        })}
                        <li>
                            <Link to="explore" reloadDocument={true} className="no-underline">
                                Add Query
                            </Link>
                        </li>
                    </ul>
                    <h2>Tables</h2>
                    <DatasetSchema tables={tables} />
                </div>
            </section>
        </div>
    );
}
