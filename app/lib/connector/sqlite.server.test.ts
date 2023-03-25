import { describe, expect, it } from "vitest";
import type { SqliteDatabase } from "~/lib/connector/sqlite.server";
import { SqliteConnection } from "~/lib/connector/sqlite.server";

describe("SqliteDatabase", () => {

    let db: SqliteDatabase;

    beforeEach(async () => {
        const connection = new SqliteConnection({ filePath: ":memory:", readonly: false });
        db = await connection.connect();
        await db.exec(`
            CREATE TABLE "Workspace"
            (
                "id"        TEXT     NOT NULL PRIMARY KEY,
                "name"      TEXT     NOT NULL,
                "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" DATETIME NOT NULL
            );
        `);
    });

    afterEach(() => {
        db.close();
    });

    // WARNING: this will fail on windows due path delimiter issues
    describe("normalizeAndValidate", () => {

        it("should allow opening in-memory dbs", () => {
            expect(new SqliteConnection({ filePath: ":memory:" })
                .normalizeAndValidate()).toBe(":memory:");
        });

        it("should normalize relative paths from the `dataDir`", () => {
            const dataDir = "/data";

            expect(new SqliteConnection({ filePath: "./file.db" })
                .normalizeAndValidate()).toBe(process.cwd() + "/data/file.db");

            expect(new SqliteConnection({ filePath: "./file.db", dataDir })
                .normalizeAndValidate()).toBe("/data/file.db");

            expect(new SqliteConnection({ filePath: "../../../../../file.db", dataDir })
                .normalizeAndValidate()).toBe("/file.db");

            expect(new SqliteConnection({ filePath: "~/file.db", dataDir })
                .normalizeAndValidate()).toBe("/data/~/file.db");

        });

        it("should normalize rooted paths", () => {
            expect(new SqliteConnection({ filePath: "/a/b/c/file.db" })
                .normalizeAndValidate()).toBe("/a/b/c/file.db");

            expect(new SqliteConnection({ filePath: "/a/b/c/../file.db" })
                .normalizeAndValidate()).toBe("/a/b/file.db");

        });

        it("should only allow files matching the allowedPath patterns", () => {

            const allowedPaths = [
                "/data/**/*.db",
                "/abc/data/**/*.db"
            ];
            const dataDir = "/data";

            expect(() => new SqliteConnection({ filePath: "/a/b/c/file.db", allowedPaths, dataDir })
                .normalizeAndValidate()).toThrowError("Invalid file location");

            expect(() => new SqliteConnection({ filePath: "/data/def/file.zip", allowedPaths, dataDir })
                .normalizeAndValidate()).toThrowError("Invalid file location");


            expect(new SqliteConnection({ filePath: "/data/file.db" })
                .normalizeAndValidate()).toBe("/data/file.db");

            expect(new SqliteConnection({ filePath: "/data/def/file.db" })
                .normalizeAndValidate()).toBe("/data/def/file.db");

            expect(new SqliteConnection({ filePath: "/abc/data/xyz/file.db" })
                .normalizeAndValidate()).toBe("/abc/data/xyz/file.db");
        });

        it("should only allow supported file extensions", () => {

            const allowedPaths: string[] = [];
            const dataDir = "/data";

            expect(() => new SqliteConnection({ filePath: "file.json", allowedPaths, dataDir })
                .normalizeAndValidate()).toThrowError("Invalid file type .json");

            expect(() => new SqliteConnection({ filePath: "file.csv", allowedPaths, dataDir })
                .normalizeAndValidate()).toThrowError("Invalid file type .csv");

            expect(() => new SqliteConnection({ filePath: "file", allowedPaths, dataDir })
                .normalizeAndValidate()).toThrowError("Invalid file type ");

            expect(new SqliteConnection({ filePath: "file.db", dataDir })
                .normalizeAndValidate()).toBe("/data/file.db");

            expect(new SqliteConnection({ filePath: "file.sqlite", dataDir })
                .normalizeAndValidate()).toBe("/data/file.sqlite");

        });
    });

    describe("getTables", () => {

        it("should describe db schema", async () => {
            const schema = await db.getSchema();

            expect(schema).toBeDefined();
            expect(schema).toContainEqual({
                name: "Workspace",
                columns: [
                    { name: "id", type: "TEXT" },
                    { name: "name", type: "TEXT" },
                    { name: "createdAt", type: "DATETIME" },
                    { name: "updatedAt", type: "DATETIME" }
                ]
            });
        });
    });

    describe("loadSqleanExtensions", () => {

        it("should load sqlean crypto extension", async () => {
            expect(db.query(`select ceil(3.3);`))
                .resolves.toEqual([{ "ceil(3.3)": 4 }]);
        });

        it("should NOT load sqlean define extension", async () => {
            expect(() => db.query(`select define('subxy', '?1 - ?2')`))
                .toThrowError("no such function: define");
        });

        it("should NOT load sqlean fileio extension", async () => {
            expect(() => db.query(`select fileio_mode(16877)`))
                .toThrowError("no such function: fileio_mode");
        });

        it("should load sqlean fuzzy extension", async () => {
            expect(db.query(`select dlevenshtein('abc', 'ab');`))
                .resolves.toEqual([{ "dlevenshtein('abc', 'ab')": 1 }]);
        });

        it("should load sqlean ipaddr extension", async () => {
            expect(db.query(`select ipfamily('192.168.16.12/24');`))
                .resolves.toEqual([{ "ipfamily('192.168.16.12/24')": 4 }]);
        });

        it("should load sqlean json1 extension", async () => {
            expect(db.query(`select json_extract('{"answer":42}', '$.answer');`))
                .resolves.toEqual([{ "json_extract('{\"answer\":42}', '$.answer')": 42 }]);
        });

        it("should load sqlean math extension", async () => {
            expect(db.query(`select hex(sha256('abc'));`))
                .resolves.toEqual([{ "hex(sha256('abc'))": "BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD" }]);
        });

        it("should load sqlean regexp extension", async () => {
            expect(db.query(`select regexp_replace('the year is 2021', '[0-9]+', '2050')`))
                .resolves.toEqual([{ "regexp_replace('the year is 2021', '[0-9]+', '2050')": "the year is 2050" }]);
        });

        it("should load sqlean stats extension", async () => {
            expect(db.query(`
                select percentile(value, 25)
                from generate_series(1, 99);`))
                .resolves.toEqual([{ "percentile(value, 25)": 25.5 }]);
        });

        it("should load sqlean text extension", async () => {
            expect(db.query(`select reverse('hello')`))
                .resolves.toEqual([{ "reverse('hello')": "olleh" }]);
        });

        it("should load sqlean unicode extension", async () => {
            expect(db.query(`select lower('hElLo')`))
                .resolves.toEqual([{ "lower('hElLo')": "hello" }]);
        });

        it("should load sqlean uuid extension", async () => {
            expect(db.query(`select uuid_str('d5a80b20-0d8f-11e5-b8cb-080027b6ec40')`))
                .resolves.toContainEqual({ "uuid_str('d5a80b20-0d8f-11e5-b8cb-080027b6ec40')": "d5a80b20-0d8f-11e5-b8cb-080027b6ec40" });
        });

        it("should load sqlean vsv extension", async () => {
            await db.exec(`
                create virtual table people using vsv(
                    filename=fixtures/datasets/people.csv,
                    schema="create table people(id integer, name text, city text)",
                    columns=3,
                    affinity=integer
                );            
            `);
            expect(db.query(`select id, name, city
                             from people
                             where id = 22`))
                .resolves.toContainEqual({ id: 22, name: "Grace", city: "Berlin" });
        });
    });
});


