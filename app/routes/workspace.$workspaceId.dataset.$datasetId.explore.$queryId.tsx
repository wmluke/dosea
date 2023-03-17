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

export interface QueryPageLoaderReturn<T = Array<Record<string, any>>> {
    query: QueryWithDatasetAndCharts;
    queryResult: {
        result?: T;
        error?: QueryError;
    };
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

/**
 * Living pretty dangerously.
 * This method lacks any safeguards against SQL injection and imposes no controls on the number of query results
 * TODO: At a minimum: sanitize and validate "sql" input and inject query limits
 */
export async function runQueryDangerouslyAndUnsafe<T = ChartData>(query: QueryWithDatasetAndCharts): Promise<{ result?: T, error?: QueryError }> {
    if (!query) {
        return { error: { message: "No query" } };
    }
    const db = await connect(query.dataset.connection, query.dataset.type);
    try {
        const result = (await db.queryDangerouslyAndUnsafe(query.query)) as T;
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
    const queryResult = await runQueryDangerouslyAndUnsafe(query);
    return json({ query, queryResult });
}

export default function QueryPage() {
    const data = useLoaderData<typeof loader>();
    return (
        <div className="w-full overflow-hidden">
            <Outlet />


            {/* @ts-ignore */}
            <ChartsGrid charts={data.query?.charts ?? []} queryResult={data.queryResult.result} />
        </div>
    );
}
