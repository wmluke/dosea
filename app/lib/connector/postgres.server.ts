import { Pool } from "pg";
import type { Connection, ConnectionOptions, DB, Table } from "~/lib/connector/connection.server";


export class PostgresConnection implements Connection {

    constructor(private readonly url: string) {
    }

    public async connect({ readonly = true }: ConnectionOptions = {}): Promise<DB> {
        const client = new Pool({
            connectionString: this.url,
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

    public async getTables(): Promise<Table[]> {
        const res = await this.client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public';
        `);
        const tables: Table[] = [];
        for (const row of res.rows) {
            const tableName = row["table_name"];
            const tableColsResult = await this.client.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = $1`, [tableName]);
            tables.push({
                name: tableName,
                columns: tableColsResult.rows.map(({ column_name, data_type }) => {
                    return {
                        name: column_name,
                        type: data_type
                    };
                })
            });
        }
        return tables;
    }

    public async query(sql: string): Promise<any> {
        const queryResult = await this.client.query(sql);
        return queryResult.rows;
    }

}
