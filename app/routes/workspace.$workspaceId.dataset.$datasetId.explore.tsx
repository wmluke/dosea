import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Chart } from "~/components/chart";
import { connect } from "~/lib/connector/sqlite";
import { getDatasetById } from "~/models/dataset.server";

interface QueryError {
    code?: string;
    message?: string;
    type?: string;
}

interface QueryResults<T = Array<Record<string, any>>> {
    query?: string;
    error?: QueryError;
    result?: T;
}

function queryResults<T = Array<Record<string, any>>>({
    query,
    result,
    error,
}: QueryResults<T> = {}): QueryResults<T> {
    return {
        query,
        result,
        error,
    };
}

function err(e: any): QueryError {
    return {
        code: e?.code,
        message: e?.message,
        type: e?.name ?? typeof e,
    };
}

export async function loader({ params, request }: LoaderArgs) {
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

    const url = new URL(request.url);
    const query = url.searchParams.get("query");
    if (!query) {
        return json({ dataset, queryResult: queryResults() });
    }

    const db = await connect(dataset.connection, dataset.type);
    try {
        const result = await db.query(query as string);
        return json({ dataset, queryResult: queryResults({ result, query }) });
    } catch (e: any) {
        console.warn("Dataset Explorer Query Error");
        console.warn(e);
        return json({
            dataset,
            queryResult: queryResults({ error: err(e), query }),
        });
    } finally {
        await db.close();
    }
}

export default function DatasetExplorePage() {
    const data = useLoaderData<typeof loader>();

    return (
        <>
            <h2 className="prose">Explore</h2>
            <form method="get">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Query</span>
                        <span className="label-text-alt">
                            {data.dataset.type}
                        </span>
                    </label>
                    <textarea
                        name="query"
                        className="textarea-bordered textarea h-24"
                        defaultValue={data?.queryResult?.query}
                        placeholder="Select * FROM..."
                    ></textarea>
                </div>
                <div className="my-4 flex items-center justify-between">
                    <button className="btn-primary btn-sm btn gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                            />
                        </svg>
                        Run
                    </button>
                </div>
            </form>
            <div>
                <h3 className="prose">Query Results</h3>
                <div className="flex w-full justify-between">
                    <pre className="prose">
                        {JSON.stringify(
                            data.queryResult.result ?? data.queryResult.error,
                            null,
                            2
                        )}
                    </pre>
                    <Chart data={data.queryResult.result} />
                </div>
            </div>
        </>
    );
}
