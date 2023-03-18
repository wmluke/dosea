import Database from "better-sqlite3";
import * as os from "os";

function isMacOS(): boolean {
    return os.platform().toLowerCase().includes("darwin");
}

function isLinux(): boolean {
    return os.platform().toLowerCase().includes("linux");
}

function isWindows() {
    return os.platform().toLowerCase().includes("win");
}

function isArm(): boolean {
    return os.arch().toLowerCase().includes("arm");
}

function isX86(): boolean {
    return os.arch().toLowerCase().includes("x86");
}

function getDist(): string | undefined {
    if (isMacOS() && isArm()) {
        return "macos-arm64";
    }
    if (isLinux() && isX86()) {
        return "linux-x86";
    }
    return;
}

const getExtension = (): string | undefined => {
    if (isWindows()) {
        return "dll";
    }
    if (isLinux()) {
        return "so";
    }
    if (isMacOS()) {
        return "dylib";
    }
    return;
};


export interface ConnectionOptions {
    readonly?: boolean;
}

export interface Connection {
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

export class SqliteConnection implements Connection {
    constructor(private readonly url: string) {
    }

    public connect({ readonly = true }: ConnectionOptions = {}): Promise<SqliteDatabase> {
        const db = new Database(this.url, { readonly });
        SqliteConnection.loadSqleanExtensions(db);
        return Promise.resolve(new SqliteDatabase(db));
    }

    static loadSqleanExtensions(db: Database.Database) {
        const dist = getDist();
        const ext = getExtension();
        if (!dist || !ext) {
            console.warn("Failed to determine sqlean build");
            return;
        }
        try {
            db.loadExtension(`bin/sqlean/0.19.3/${dist}/stats.${ext}`);
        } catch (e) {
            console.error("!!! Failed to load sqlean extensions");
            console.error(e);
        }
    }
}

export class SqliteDatabase implements DB {
    constructor(private readonly db: Database.Database) {
    }

    public close(): Promise<void> {
        this.db.close();
        return Promise.resolve();
    }

    public getTables(): Promise<Table[]> {
        const rawTables = this.db
            .prepare(
                `
                SELECT name
                FROM (SELECT * FROM sqlite_schema UNION ALL SELECT * FROM sqlite_temp_schema)
                WHERE type = 'table'
                ORDER BY name;
                `.trim()
            )
            .all();

        return Promise.resolve(
            rawTables.map(({ name: tName }) => {
                const columns = this.db.prepare("SELECT * FROM PRAGMA_TABLE_INFO(?)").all(tName);
                return {
                    name: tName as string,
                    columns: columns.map(({ name, type }) => {
                        return {
                            name: name as string,
                            type: type as string
                        };
                    })
                };
            })
        );
    }

    public query(sql: string): Promise<any> {
        const r = this.db.prepare(sql).all();
        return Promise.resolve(r);
    }

    public exec(sql: string): Promise<any> {
        const r = this.db.prepare(sql).run();
        return Promise.resolve(r);
    }
}

export function connect(url: string, type: string): Promise<DB> {
    switch (type) {
        case "sqlite":
            return new SqliteConnection(url).connect();
        default:
            throw "Unsupported dataset type";
    }
}
