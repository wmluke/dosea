import slugify from "@sindresorhus/slugify";
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

export class CsvConnection implements Connection {
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


    public async connect(): Promise<DB> {
        const db = await new SqliteConnection({ filePath: ":memory:", readonly: false })
            .connect();

        const filePath = this.normalizeAndValidate();
        const ext = path.extname(filePath) ?? "";
        const separator = extensions[ext.toLowerCase()];

        const name = slugify(path.basename(filePath), {
            separator: "_",
            lowercase: true
        });

        await db.exec(generateCreateVSVTable({ name, filePath, separator }));
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
