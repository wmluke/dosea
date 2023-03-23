import { Client } from "pg";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PostgresConnection } from "~/lib/connector/postgres.server";

describe("PostgresConnection", () => {

    describe("getTables", () => {
        let client: Client;

        const connectionString = process.env.DOSEA_TEST_DATASET_PG ?? "postgresql://localhost:5432/dosea_test_dataset";

        beforeEach(async () => {
            client = new Client(connectionString);
            await client.connect();
            await client.query(`
                CREATE TABLE IF NOT EXISTS "Workspace"
                (
                    "id"        TEXT      NOT NULL PRIMARY KEY,
                    "name"      TEXT      NOT NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP NOT NULL
                );
            `);
        });

        afterEach(async () => {
            await client.query("DROP TABLE IF EXISTS \"Workspace\";");
            await client.end();
        });

        // skip until i provision DOSEA_TEST_DATASET_PG in GH workflow
        it.skip("should describe db tables", async () => {
            const connection = new PostgresConnection({
                connectionString: connectionString,
                readonly: true
            });
            const db = await connection.connect();
            const tables = await db.getTables();
            expect(tables).toBeDefined();
            expect(tables).toContainEqual({
                name: "Workspace",
                columns: [
                    { name: "id", type: "text" },
                    { name: "name", type: "text" },
                    { name: "createdAt", type: "timestamp without time zone" },
                    { name: "updatedAt", type: "timestamp without time zone" }
                ]
            });
        });
    });


    describe("normalizeAndValidate", () => {

        it("should reject invalid postgres connection strings", () => {
            expect(
                () => new PostgresConnection({ connectionString: "" }).normalizeAndValidate()
            ).toThrowError("Invalid postgres connection: empty postgres connection string");

            expect(
                () => new PostgresConnection({ connectionString: "http://foo.com/db" }).normalizeAndValidate()
            ).toThrowError("Invalid postgres connection: invalid protocol");

            expect(
                () => new PostgresConnection({ connectionString: "file://foo/db" }).normalizeAndValidate()
            ).toThrowError("Invalid postgres connection: invalid protocol");

            expect(
                () => new PostgresConnection({ connectionString: "/foo/db" }).normalizeAndValidate()
            ).toThrowError("Invalid postgres connection: invalid protocol");

            expect(
                () => new PostgresConnection({ connectionString: "foo" }).normalizeAndValidate()
            ).toThrowError("Invalid postgres connection: invalid protocol");

            expect(
                () => new PostgresConnection({ connectionString: "postgresql://foo" }).normalizeAndValidate()
            ).toThrowError("Invalid postgres connection: missing database");

            expect(
                () => new PostgresConnection({ connectionString: "postgresql://foo:5432/path/to/db" }).normalizeAndValidate()
            ).toThrowError("Invalid postgres connection: invalid database name");

            expect(
                () => new PostgresConnection({ connectionString: "postgresql://fo  o:5432/db" }).normalizeAndValidate()
            ).toThrowError("Invalid postgres connection string");
        });

        it("should accept valid postgres connection strings", () => {

            expect(new PostgresConnection({ connectionString: "postgresql://foo/db" }).normalizeAndValidate())
                .toBe("postgresql://foo/db");

            expect(new PostgresConnection({ connectionString: "postgresql://foo:5432/db" }).normalizeAndValidate())
                .toBe("postgresql://foo:5432/db");

            expect(new PostgresConnection({ connectionString: "postgresql://bob:secret@foo/db" }).normalizeAndValidate())
                .toBe("postgresql://bob:secret@foo/db");

            expect(new PostgresConnection({ connectionString: "postgresql://foo/db?user=bob&password=secret" }).normalizeAndValidate())
                .toBe("postgresql://foo/db?user=bob&password=secret");

        });
    });

});

