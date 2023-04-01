import LRUCache from "lru-cache";
import type { ChartData } from "~/components/chart/chart";
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
        max: 100,
        ttl: NO_CACHE ? 1 : (14 * 24 * 60 * 60 * 1000),
        allowStale: false,
        noDeleteOnFetchRejection: true,
        maxSize: 5000,
        sizeCalculation: (entry) => {
            if (Array.isArray(entry.result)) {
                return entry.result.length;
            }
            return 1;
        },
        fetchMethod: async (key: string, staleValue, { signal }) => {
            if (signal.aborted) {
                throw Error("Operation aborted");
            }
            const [queryId, datasetId] = key.split("::");
            const query = await getQueryById(queryId);
            if (signal.aborted) {
                throw Error("Operation aborted");
            }
            if (!query) {
                throw Error("Not Found: query");
            }
            if (datasetId && datasetId !== query.datasetId) {
                throw Error("Not Found: query");
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
        throw notFound("Query");
    }
    if (datasetId && query.datasetId !== datasetId) {
        throw badRequest();
    }
    return query;
}


function parseQueryOptionsJson(queryOptionsJson?: string | null) {
    const obj = JSON.parse(queryOptionsJson ?? "{}");
    if (typeof obj.start === "string") {
        obj.start = new Date(obj.start);
    }
    if (typeof obj.end === "string") {
        obj.end = new Date(obj.end);
    }
    return obj;
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
        const result = (await db.query(query.query, parseQueryOptionsJson(query.queryOptionsJson))) as T;
        const duration = Date.now() - start;
        console.log(`=> Query ${query.id} duration: ${duration / 1000}`);
        return { result };
    } catch (e: any) {
        console.warn("Dataset Explorer Query Error");
        console.warn(e);
        return { error: err(e) };
    }
}

export async function runQuery({
                                   queryId,
                                   datasetId
                               }: {
    queryId?: string;
    datasetId?: string;
}) {
    return runQueryCache.fetch([queryId, datasetId].join("::"));
}
