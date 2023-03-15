import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { connect } from "~/lib/connector/sqlite";
import { getDatasetById } from "~/models/dataset.server";

export async function loader({ params }: LoaderArgs) {
    const { workspaceId, datasetId } = params;
    if (!datasetId) {
        throw new Response("Not Found", {
            status: 404,
        });
    }
    const dataset = await getDatasetById(datasetId as string);
    if (!dataset) {
        throw new Response("Not Found", {
            status: 404,
        });
    }
    if (dataset.workspaceId != workspaceId) {
        throw new Response("Not Found", {
            status: 404,
        });
    }

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
    if (!datasetId) {
        throw new Response("Not Found", {
            status: 404,
        });
    }
    const dataset = await getDatasetById(datasetId as string);
    if (!dataset) {
        throw new Response("Not Found", {
            status: 404,
        });
    }
    if (dataset.workspaceId != workspaceId) {
        throw new Response("Not Found", {
            status: 404,
        });
    }

    const db = await connect(dataset.connection, dataset.type);

    const form = await request.formData();
    const query = form.get("query");
    if (!query) {
        throw "Invalid argument.  Missing query.";
    }

    const queryResults = await db.query(query as string);
    return json({ queryResults, query });
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
                    <h2>Tables</h2>
                    <ul>
                        {tables.map((t) => {
                            return (
                                <li key={t.name}>
                                    {t.name}
                                    <ul>
                                        {t.columns.map((c) => {
                                            return (
                                                <li key={`${t.name}.${c.name}`}>
                                                    {c.name}: {c.type}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>
        </div>
    );
}
