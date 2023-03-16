import type { ChartConfig, Dataset, DatasetQuery } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Chart } from "~/components/chart";
import { QueryResultsInspector } from "~/components/queryResultsInspector";
import { connect } from "~/lib/connector/sqlite";
import { getChartConfigsByQueryId } from "~/models/chartconfig.server";
import { getQueryById } from "~/models/query.server";
import { loadDataset } from "~/routes/workspace.$workspaceId.dataset.$datasetId";
import { badRequest, notFound } from "~/utils";

export interface QueryError {
    code?: string;
    message?: string;
    type?: string;
}

export interface QueryResults<T = Array<Record<string, any>>> {
    dataset: Dataset;
    query: DatasetQuery;
    result?: T;
    charts?: ChartConfig[];
    error?: QueryError;
}

function err(e: any): QueryError {
    return {
        code: e?.code,
        message: e?.message,
        type: e?.name ?? typeof e,
    };
}

export async function loadQuery({
    queryId,
    datasetId,
}: {
    queryId?: string;
    datasetId?: string;
}): Promise<Partial<DatasetQuery> | null> {
    if (!queryId) {
        return Promise.resolve({});
    }
    const query = await getQueryById(queryId);
    if (!query) {
        throw notFound();
    }
    if (datasetId && query.datasetId !== datasetId) {
        throw badRequest();
    }
    return query;
}

export async function loader({ params }: LoaderArgs) {
    const { workspaceId, datasetId, queryId } = params;
    const dataset = await loadDataset(datasetId, workspaceId);
    const query = await loadQuery({ queryId });

    if (!query?.query) {
        return json({ dataset, query } as QueryResults);
    }

    const charts = queryId ? await getChartConfigsByQueryId(queryId) : [];

    const db = await connect(dataset.connection, dataset.type);
    try {
        const result = await db.query(query.query);
        return json({ dataset, query, result, charts } as QueryResults);
    } catch (e: any) {
        console.warn("Dataset Explorer Query Error");
        console.warn(e);
        return json({ dataset, query, error: err(e), charts } as QueryResults);
    } finally {
        await db.close();
    }
}

export default function QueryPage() {
    const data = useLoaderData<typeof loader>();
    return (
        <>
            <h3 className="prose">Query Results</h3>
            <div className="flex w-full justify-between">
                <QueryResultsInspector result={data.result} error={data.error} />
                <div className="grow">
                    <Outlet />
                    {data.charts?.map((chart) => {
                        return (
                            <div key={chart.id} className="card card-compact w-full bg-base-100 shadow-xl">
                                <figure>
                                    <Chart
                                        key={chart.id}
                                        data={data.result ?? []}
                                        config={JSON.parse(chart.configJson)}
                                    />
                                </figure>
                                <div className="card-body">
                                    <div className="card-actions justify-end">
                                        <Link to={["chart", chart.id].join("/")} className="btn-secondary btn-xs btn">
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
