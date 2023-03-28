import path from "path";
import type { QueryResult as PGQueryResult } from "pg";
import type { QueryResult as PromQueryResult } from "prometheus-query/dist/types";
import { CsvConnection } from "~/lib/connector/csv.server";
import { PostgresConnection } from "~/lib/connector/postgres.server";
import type { PromSchema } from "~/lib/connector/prometheus.server";
import { PrometheusConnection } from "~/lib/connector/prometheus.server";
import type { SqliteQueryResult } from "~/lib/connector/sqlite.server";
import { SqliteConnection } from "~/lib/connector/sqlite.server";


export type Schema = Table[] | PromSchema;
export type QueryResult = SqliteQueryResult | PGQueryResult | PromQueryResult;

export interface Connection<S = Schema, O = never, R = QueryResult> {

    normalizeAndValidate(): string;

    connect(): Promise<DB<S, O, R>>;

    test(): Promise<boolean>;
}

export interface Column {
    name: string;
    type: string;
}

export interface Table {
    name: string;
    columns: Column[];
}

export interface DB<S = Schema, OPS = Object, R = QueryResult> {
    close(): Promise<void>;

    getSchema(): Promise<S>;

    query(sql: string, options?: OPS): Promise<R>;

    exec(sql: string): Promise<any>;
}

declare global {
    var __dbs__: Map<string, DB>;
}
let _dbs: Map<string, DB>;

if (process.env.NODE_ENV === "production") {
    _dbs = new Map<string, DB>();
} else {
    if (!global.__dbs__) {
        global.__dbs__ = new Map<string, DB>();
    }
    _dbs = global.__dbs__;
}


function createConnection(url: string, type: string): Connection<Schema, any, QueryResult> {
    const readonly = true;
    const dataDir = process.env.DOSEA_DATA_DIR ?? path.resolve(process.cwd(), "data");
    const allowedPaths = [process.env.DOSEA_ALLOWED_PATHS ?? `${dataDir}/**/*`];
    switch (type) {
        case "sqlite":
            return new SqliteConnection({ filePath: url, readonly, dataDir, allowedPaths });
        case "postgres":
            return new PostgresConnection({ connectionString: url, readonly });
        case "csv":
            return new CsvConnection({ filePath: url, dataDir, allowedPaths });
        case "prometheus":
            return new PrometheusConnection({ endpoint: url });
        default:
            throw "Unsupported dataset type";
    }
}

export async function connect(url: string, type: string): Promise<DB> {
    const key = `${type}::${url}`;
    if (!_dbs.has(key)) {
        const connection = createConnection(url, type);
        await connection.test();
        _dbs.set(key, await connection.connect());
    }
    return _dbs.get(key)!;
}
