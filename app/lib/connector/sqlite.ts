import Database from "better-sqlite3";

export interface Connection {
    connect(): Promise<DB>;
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
}

export class SqliteConnection implements Connection {
    constructor(private readonly url: string) {}

    public connect(): Promise<SqliteDatabase> {
        const db = new Database(this.url);
        db.pragma("journal_mode = WAL");
        return Promise.resolve(new SqliteDatabase(db));
    }
}

export class SqliteDatabase implements DB {
    constructor(private readonly db: Database.Database) {}

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
                            type: type as string,
                        };
                    }),
                };
            })
        );
    }

    public query(sql: string): Promise<any> {
        // console.log('SQL');
        // console.log(sql);
        const r = this.db.prepare(sql).all();
        // console.log('RESULTS')
        // console.log(r)
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
