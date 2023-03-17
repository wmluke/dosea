import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import type { ChartData } from "~/components/chart";
import { ChartsGrid } from "~/components/charts-grid";
import { connect } from "~/lib/connector/sqlite";
import type { QueryWithDatasetAndCharts } from "~/models/query.server";
import { getQueryById } from "~/models/query.server";
import { badRequest, notFound } from "~/utils";

export interface QueryError {
    code?: string;
    message?: string;
    type?: string;
}

export interface QueryResults<T = Array<Record<string, any>>> {
    query: QueryWithDatasetAndCharts;
    result?: T;
    error?: QueryError;
}

function err(e: any): QueryError {
    return {
        code: e?.code,
        message: e?.message,
        type: e?.name ?? typeof e
    };
}

export async function loadQuery({
                                    queryId,
                                    datasetId
                                }: {
    queryId?: string;
    datasetId?: string;
}): Promise<QueryWithDatasetAndCharts> {
    if (!queryId) {
        return Promise.resolve(null);
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

export async function runQuery<T = ChartData>(query: QueryWithDatasetAndCharts): Promise<{ result?: T, error?: QueryError }> {
    if (!query) {
        return { error: { message: "No query" } };
    }
    const db = await connect(query.dataset.connection, query.dataset.type);
    try {
        const result = (await db.query(query.query)) as T;
        return { result };
    } catch (e: any) {
        console.warn("Dataset Explorer Query Error");
        console.warn(e);
        return { error: err(e) };
    } finally {
        await db.close();
    }
}

export async function loader({ params }: LoaderArgs) {
    const { datasetId, queryId } = params;
    const query = await loadQuery({ queryId, datasetId });
    const queryResults = await runQuery(query);
    return json({ queryResults, query });
}

export default function QueryPage() {
    const data = useLoaderData<typeof loader>();
    return (
        <div className="w-full overflow-hidden">
            <Outlet />


            {/* @ts-ignore */}
            <ChartsGrid charts={data.query?.charts ?? []} queryResult={data.queryResults.result} />
        </div>
    );
}
