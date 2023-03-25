import path from "path";
import { CsvConnection } from "~/lib/connector/csv.server";
import { PostgresConnection } from "~/lib/connector/postgres.server";
import type { PromSchema } from "~/lib/connector/prometheus.server";
import { PrometheusConnection } from "~/lib/connector/prometheus.server";
import { SqliteConnection } from "~/lib/connector/sqlite.server";

export interface Connection<S = Table[]> {

    normalizeAndValidate(): string;

    connect(): Promise<DB<S>>;
}

export interface Column {
    name: string;
    type: string;
}

export interface Table {
    name: string;
    columns: Column[];
}

export type Schema = Table[] | PromSchema;

export interface DB<S = Table[], OPS = Object> {
    close(): Promise<void>;

    getSchema(): Promise<S>;

    query(sql: string, options?: OPS): Promise<any>;

    exec(sql: string): Promise<any>;
}

declare global {
    var __dbs__: Map<string, DB<Schema>>;
}
let _dbs: Map<string, DB<Schema>>;

if (process.env.NODE_ENV === "production") {
    _dbs = new Map<string, DB<Schema>>();
} else {
    if (!global.__dbs__) {
        global.__dbs__ = new Map<string, DB<Schema>>();
    }
    _dbs = global.__dbs__;
}

function createConnection(url: string, type: string): Connection<Schema> {
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

export async function connect(url: string, type: string): Promise<DB<Schema>> {
    const key = `${type}::${url}`;
    if (!_dbs.has(key)) {
        const db = await createConnection(url, type).connect();
        _dbs.set(key, db);
    }
    return _dbs.get(key)!;
}
