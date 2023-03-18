import { describe, expect, test } from "vitest";
import type { SqliteDatabase } from "~/lib/connector/sqlite";
import { SqliteConnection } from "~/lib/connector/sqlite";

describe("SqliteDatabase", () => {

    let db: SqliteDatabase;

    beforeEach(async () => {
        const connection = new SqliteConnection(":memory:");
        db = await connection.connect({ readonly: false });
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

    describe("getTables", () => {

        test("should describe db tables", async () => {
            const tables = await db.getTables();

            expect(tables).toBeDefined();
            expect(tables).toContainEqual({
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
});


