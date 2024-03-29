import slugify from "@sindresorhus/slugify";
// import { constants } from "fs";
import { minimatch } from "minimatch";
import path from "path";

import type { Connection, DB, Table } from "~/lib/connector/connection.server";
import type { SqliteConnectionOptions } from "~/lib/connector/sqlite.server";
import { SqliteConnection } from "~/lib/connector/sqlite.server";
import { isEmpty } from "~/utils";

const extensions: { [ext: string]: string } = {
    ".csv": ",",
    ".tsv": "\t",
    ".txt": ","
};

function generateCreateVSVTable({ name, filePath, separator }: { name: string, filePath: string, separator: string }) {
    return `
            create virtual table ${name} using vsv(
                filename=${filePath},
                fsep='${separator}',
                affinity=numeric,
                header=true,
                nulls=true
            );        
        `;
}

export type CsvConnectionOptions = Omit<SqliteConnectionOptions, "readonly">;

export class CsvConnection implements Connection<Table[], never, any[]> {
    constructor(
        private readonly options: CsvConnectionOptions
    ) {
    }

    public normalizeAndValidate(): string {
        const { filePath, dataDir, allowedPaths } = this.options;

        const normalizeFilePath = path.resolve(
            path.normalize(dataDir ?? path.resolve(process.cwd(), "data")),
            path.normalize(filePath)
        );
        if (isEmpty(allowedPaths)) {
            console.warn("WARNING: CsvConnection allowedPaths is empty.");
        }
        const allowed = isEmpty(allowedPaths) || allowedPaths?.some((pattern) => {
            return minimatch(normalizeFilePath, pattern);
        });
        if (!allowed) {
            throw new Error("Invalid file location");
        }
        const ext = path.extname(normalizeFilePath) ?? "";
        if (!extensions[ext.toLowerCase()]) {
            throw new Error(`Invalid file type ${ext}`);
        }
        return normalizeFilePath;
    }

    public async test(): Promise<boolean> {
        const db = await this.connect();
        try {
            const [table] = await db.getSchema();
            await db.query(`SELECT *
                            FROM ${table.name}
                            WHERE 1 = 0`);
            return true;
        } finally {
            await db.close();
        }
    }

    public async connect(): Promise<DB<Table[], never, any[]>> {
        const db = await new SqliteConnection({ filePath: ":memory:", readonly: false })
            .connect();

        const filePath = this.normalizeAndValidate();
        // await access(filePath, constants.R_OK);

        const ext = path.extname(filePath) ?? "";
        const separator = extensions[ext.toLowerCase()];

        const name = slugify(path.basename(filePath), {
            separator: "_",
            lowercase: true
        });

        const sql = generateCreateVSVTable({ name, filePath, separator });
        await db.exec(sql);
        return Promise.resolve(new CsvDatabase(db));
    }
}


export class CsvDatabase implements DB<Table[], never, any[]> {

    constructor(private readonly db: DB<Table[], never, any[]>) {
    }

    public close(): Promise<void> {
        return this.db.close();
    }

    public exec(sql: string): Promise<any> {
        return this.db.exec(sql);
    }

    public getSchema(): Promise<Table[]> {
        return this.db.getSchema();
    }

    public query(sql: string): Promise<any[]> {
        return this.db.query(sql);
    }

}
