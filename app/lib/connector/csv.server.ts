import slugify from "@sindresorhus/slugify";
import path from "path";

import type { Connection, ConnectionOptions, DB, Table } from "~/lib/connector/connection.server";
import { SqliteConnection } from "~/lib/connector/sqlite.server";


export class CsvConnection implements Connection {
    constructor(
        private readonly url: string
    ) {
    }

    public async connect({ readonly = true }: ConnectionOptions = {}): Promise<DB> {
        const db = await new SqliteConnection(":memory:")
            .connect({ readonly: false });

        const name = slugify(path.basename(this.url), {
            separator: "_",
            lowercase: true
        });

        // TODO: sanitize `filename=${this.url}` to prevent someone from
        //       loading sensitive files
        await db.exec(`
            create virtual table ${name} using vsv(
                filename=${this.url},
                affinity=numeric,
                header=true,
                nulls=true
            );        
        `);
        return Promise.resolve(new CsvDatabase(db));
    }
}


export class CsvDatabase implements DB {

    constructor(private readonly db: DB) {
    }

    public close(): Promise<void> {
        return this.db.close();
    }

    public exec(sql: string): Promise<any> {
        return this.db.exec(sql);
    }

    public getTables(): Promise<Table[]> {
        return this.db.getTables();
    }

    public query(sql: string): Promise<any> {
        return this.db.query(sql);
    }

}
