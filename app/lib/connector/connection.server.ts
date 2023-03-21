import { PostgresConnection } from "~/lib/connector/postgres.server";
import { SqliteConnection } from "~/lib/connector/sqlite.server";

export interface ConnectionOptions {
    readonly?: boolean;
}

export interface ConnectionServer {
    connect(opts?: ConnectionOptions): Promise<DB>;
}

export interface Column {
    name: string;
    type: string;
}

export interface Table {
    name: string;
    columns: Column[];
}

export interface DB {
    close(): Promise<void>;

    getTables(): Promise<Table[]>;

    query(sql: string): Promise<any>;

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

function createConnection(url: string, type: string): Promise<DB> {
    switch (type) {
        case "sqlite":
            return new SqliteConnection(url).connect();
        case "postgres":
            return new PostgresConnection(url).connect();
        default:
            throw "Unsupported dataset type";
    }
}

export async function connect(url: string, type: string): Promise<DB> {
    const key = `${type}::${url}`;
    if (!_dbs.has(key)) {
        const db = await createConnection(url, type);
        _dbs.set(key, db);
    }
    return _dbs.get(key)!;
}
