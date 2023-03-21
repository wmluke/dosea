import Database from "better-sqlite3";
import * as os from "os";
import type { ConnectionOptions, ConnectionServer, DB, Table } from "~/lib/connector/connection.server";

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

function isX64(): boolean {
    return os.arch().toLowerCase().includes("x64");
}

function getDist(): string | undefined {
    if (isMacOS() && isArm()) {
        return "macos-arm64";
    }
    if (isLinux() && (isX86() || isX64)) {
        return "linux-x86";
    }
    return;
}

/**
 * https://github.com/nalgeon/sqlean
 */
const sqleanExtensions = [
    "crypto",
    //"define",
    //"fileio",
    "fuzzy",
    "ipaddr",
    "json1",
    "math",
    "regexp",
    "stats",
    "text",
    "unicode",
    "uuid",
    "vsv"
];

export class SqliteConnection implements ConnectionServer {
    constructor(private readonly url: string) {
    }

    public connect({ readonly = true }: ConnectionOptions = {}): Promise<SqliteDatabase> {
        const db = new Database(this.url, { readonly });
        SqliteConnection.loadSqleanExtensions(db);
        return Promise.resolve(new SqliteDatabase(db));
    }

    static loadSqleanExtensions(db: Database.Database) {
        const dist = getDist();
        if (!dist) {
            console.warn(`Failed to determine sqlean build for ${os.platform()} / ${os.arch()}`);
            return;
        }
        for (const extension of sqleanExtensions) {
            const path = `bin/sqlean/0.19.3/${dist}/${extension}`;
            try {
                db.loadExtension(path);
                console.log(`Loaded sqlite sqlean ${extension} extension`);
            } catch (e) {
                console.error(`! Failed to load sqlean ${extension} extension`);
                console.error(e);
            }
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


