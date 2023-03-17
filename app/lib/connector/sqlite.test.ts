import { expect, test } from "vitest";
import { SqliteConnection } from "~/lib/connector/sqlite";

test("should describe db tables", async () => {
    const connection = new SqliteConnection("./fixtures/data.db");

    const sqliteDatabase = await connection.connect();
    const tables = await sqliteDatabase.getTables();

    expect(tables).toBeDefined();
    expect(tables).toContainEqual({
        name: "Workspace",
        columns: [
            { name: "id", type: "TEXT" },
            { name: "name", type: "TEXT" },
            { name: "createdAt", type: "DATETIME" },
            { name: "updatedAt", type: "DATETIME" },
        ],
    });

    await sqliteDatabase.close();
});
