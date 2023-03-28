import { Client, Pool } from "pg";
import type { Connection, DB, Table } from "~/lib/connector/connection.server";

export interface PostgresConnectionOptions {
    connectionString: string;
    readonly?: boolean;
}


function createUrl(connectionString: string) {
    try {
        return new URL(connectionString);
    } catch (e) {
        throw new Error("Invalid postgres connection string");
    }
}

export class PostgresConnection implements Connection {

    constructor(private readonly options: PostgresConnectionOptions) {
    }

    public normalizeAndValidate(): string {
        const { connectionString } = this.options;
        if (!connectionString) {
            throw new Error("Invalid postgres connection: empty postgres connection string");
        }
        if (!(connectionString.startsWith("postgres://") || connectionString.startsWith("postgresql://"))) {
            throw new Error("Invalid postgres connection: invalid protocol");
        }
        const url = createUrl(connectionString);
        if (!url.pathname) {
            throw new Error("Invalid postgres connection: missing database");
        }
        if (url.pathname.lastIndexOf("/") != 0) {
            throw new Error("Invalid postgres connection: invalid database name");
        }
        return url.toString();

    }

    public async test(): Promise<boolean> {
        const connectionString = this.normalizeAndValidate();
        const client = new Client({
            connectionString,
            application_name: "dosea",
            options: "-c default_transaction_read_only=on"
        });
        try {
            await client.connect();
            await client.query("SELECT 1;");
            return true;
        } finally {
            await client.end();
        }
    }

    public async connect(): Promise<DB> {
        const { readonly } = this.options;
        const connectionString = this.normalizeAndValidate();
        const client = new Pool({
            connectionString,
            application_name: "dosea",
            options: readonly ? "-c default_transaction_read_only=on" : undefined
        });
        await client.connect();
        return Promise.resolve(new PostgresDB(client));
    }
}

export class PostgresDB implements DB {

    constructor(private readonly client: Pool) {
    }

    public close(): Promise<void> {
        return this.client.end();
    }

    public exec(sql: string): Promise<any> {
        return this.client.query(sql);
    }

    public async getSchema(): Promise<Table[]> {
        const res = await this.client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public';
        `);
        const schema: Table[] = [];
        for (const row of res.rows) {
            const tableName = row["table_name"];
            const tableColsResult = await this.client.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = $1`, [tableName]);
            schema.push({
                name: tableName,
                columns: tableColsResult.rows.map(({ column_name, data_type }) => {
                    return {
                        name: column_name,
                        type: data_type
                    };
                })
            });
        }
        return schema;
    }

    public async query(sql: string): Promise<any> {
        const queryResult = await this.client.query(sql);
        return queryResult.rows;
    }

}
