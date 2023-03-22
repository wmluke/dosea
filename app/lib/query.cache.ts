import LRUCache from "lru-cache";
import type { ChartData } from "~/components/chart";
import { connect } from "~/lib/connector/connection.server";
import type { QueryWithDatasetAndCharts } from "~/models/query.server";
import { getQueryById } from "~/models/query.server";
import { badRequest, notFound } from "~/utils";


export interface QueryError {
    code?: string;
    message?: string;
    type?: string;
}

function err(e: any): QueryError {
    return {
        code: e?.code,
        message: e?.message,
        type: e?.name ?? typeof e
    };
}

declare global {
    var __runQueryCache__: LRUCache<string, { result?: ChartData, error?: QueryError }>;
}

const NO_CACHE = process.env.NO_CACHE;

let runQueryCache: LRUCache<string, { result?: ChartData, error?: QueryError }>;

if (process.env.NODE_ENV === "production") {
    runQueryCache = makeQueryCache();
} else {
    if (!global.__runQueryCache__) {
        global.__runQueryCache__ = makeQueryCache();
    }
    runQueryCache = global.__runQueryCache__;
}

export { runQueryCache };

function makeQueryCache() {
    return new LRUCache<string, { result?: ChartData, error?: QueryError }>({
        max: 10,
        ttl: NO_CACHE ? 1 : 300000, // 5 minutes
        allowStale: !NO_CACHE,
        noDeleteOnFetchRejection: true,
        maxSize: 5000,
        sizeCalculation: (entry) => {
            if (entry.error) {
                return Object.keys(entry.error).length;
            }
            if (Array.isArray(entry.result)) {
                return entry.result.length;
            }
            return Object.keys(entry?.result as unknown as object).length;
        },
        fetchMethod: async (key: string) => {
            const [queryId, datasetId] = key.split("::");

            const query = await getQueryById(queryId);
            if (!query) {
                return;
            }
            if (datasetId && datasetId !== query.datasetId) {
                return;
            }
            return runQueryDangerouslyAndUnsafe<ChartData>(query);
        }

    });
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
    try {
        const db = await connect(query.dataset.connection, query.dataset.type);
        const start = Date.now();
        const result = (await db.query(query.query)) as T;
        const duration = Date.now() - start;
        console.log(`=> Query ${query.id} duration: ${duration / 1000}`);
        return { result };
    } catch (e: any) {
        console.warn("Dataset Explorer Query Error");
        console.warn(e);
        return { error: err(e) };
    }
}

export async function runQuery<T = ChartData>({
                                                  queryId,
                                                  datasetId
                                              }: {
    queryId?: string;
    datasetId?: string;
}) {
    return runQueryCache.fetch([queryId, datasetId].join("::"));
}
