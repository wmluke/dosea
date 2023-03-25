import path from "path";
import { describe, expect, it } from "vitest";
import { CsvConnection } from "~/lib/connector/csv.server";
import type { SqliteConnectionOptions } from "~/lib/connector/sqlite.server";

describe("CsvConnection", () => {

    describe("connect", () => {
        it("it should create a virtual table for the csv", async () => {

            const options: SqliteConnectionOptions = {
                filePath: "Metro_Interstate_Traffic_Volume.csv",
                dataDir: path.resolve(process.cwd(), "fixtures", "datasets")
            };
            const db = await new CsvConnection(options)
                .connect();

            const schema = await db.getSchema();

            expect(schema).toHaveLength(1);
            expect(schema[0].name).toEqual("metro_interstate_traffic_volume_csv");
            expect(schema[0].columns).toEqual([
                { name: "holiday", type: "" },
                { name: "temp", type: "" },
                { name: "rain_1h", type: "" },
                { name: "snow_1h", type: "" },
                { name: "clouds_all", type: "" },
                { name: "weather_main", type: "" },
                { name: "weather_description", type: "" },
                { name: "date_time", type: "" },
                { name: "traffic_volume", type: "" }
            ]);

            const result = await db.query("select * from metro_interstate_traffic_volume_csv order by date_time limit 2");

            expect(result).toEqual([
                {
                    holiday: "None",
                    temp: 288.28,
                    rain_1h: 0,
                    snow_1h: 0,
                    clouds_all: 40,
                    weather_main: "Clouds",
                    weather_description: "scattered clouds",
                    date_time: "2012-10-02 09:00:00",
                    traffic_volume: 5545
                },
                {
                    holiday: "None",
                    temp: 289.36,
                    rain_1h: 0,
                    snow_1h: 0,
                    clouds_all: 75,
                    weather_main: "Clouds",
                    weather_description: "broken clouds",
                    date_time: "2012-10-02 10:00:00",
                    traffic_volume: 4516
                }
            ]);

        });
    });

    // WARNING: this will fail on windows due path delimiter issues
    describe("sanitizeAndValidate", () => {

        it("should normalize relative paths from the `dataDir`", () => {
            const dataDir = "/data";

            expect(new CsvConnection({ filePath: "./file.csv" })
                .normalizeAndValidate()).toBe(process.cwd() + "/data/file.csv");

            expect(new CsvConnection({ filePath: "./file.csv", dataDir })
                .normalizeAndValidate()).toBe("/data/file.csv");

            expect(new CsvConnection({ filePath: "../../../../../file.csv", dataDir })
                .normalizeAndValidate()).toBe("/file.csv");

            expect(new CsvConnection({ filePath: "~/file.csv", dataDir })
                .normalizeAndValidate()).toBe("/data/~/file.csv");

        });

        it("should normalize rooted paths", () => {
            expect(new CsvConnection({ filePath: "/a/b/c/file.csv" })
                .normalizeAndValidate()).toBe("/a/b/c/file.csv");

            expect(new CsvConnection({ filePath: "/a/b/c/../file.csv" })
                .normalizeAndValidate()).toBe("/a/b/file.csv");

        });

        it("should only allow files matching the allowedPath patterns", () => {

            const allowedPaths = [
                "/data/**/*.csv",
                "/abc/data/**/*.csv"
            ];
            const dataDir = "/data";

            expect(() => new CsvConnection({ filePath: "/a/b/c/file.csv", allowedPaths, dataDir })
                .normalizeAndValidate()).toThrowError("Invalid file location");

            expect(() => new CsvConnection({ filePath: "/data/def/file.zip", allowedPaths, dataDir })
                .normalizeAndValidate()).toThrowError("Invalid file location");


            expect(new CsvConnection({ filePath: "/data/def/file.csv" })
                .normalizeAndValidate()).toBe("/data/def/file.csv");

            expect(new CsvConnection({ filePath: "/abc/data/xyz/file.csv" })
                .normalizeAndValidate()).toBe("/abc/data/xyz/file.csv");
        });

        it("should only allow supported file extensions", () => {

            const allowedPaths: string[] = [];
            const dataDir = "/data";

            expect(() => new CsvConnection({ filePath: "file.json", allowedPaths, dataDir })
                .normalizeAndValidate()).toThrowError("Invalid file type .json");

            expect(() => new CsvConnection({ filePath: "file", allowedPaths, dataDir })
                .normalizeAndValidate()).toThrowError("Invalid file type ");

            expect(new CsvConnection({ filePath: "file.csv", dataDir })
                .normalizeAndValidate()).toBe("/data/file.csv");

            expect(new CsvConnection({ filePath: "file.tsv", dataDir })
                .normalizeAndValidate()).toBe("/data/file.tsv");

            expect(new CsvConnection({ filePath: "file.txt", dataDir })
                .normalizeAndValidate()).toBe("/data/file.txt");
        });
    });


});
