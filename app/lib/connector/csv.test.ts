import { describe, expect, it } from "vitest";
import { CsvConnection } from "~/lib/connector/csv.server";

describe("CsvConnection", () => {

    it("it should create a virtual table for the csv", async () => {

        const db = await new CsvConnection("./fixtures/Metro_Interstate_Traffic_Volume.csv")
            .connect();

        const tables = await db.getTables();

        expect(tables).toHaveLength(1);
        expect(tables[0].name).toEqual("metro_interstate_traffic_volume_csv");
        expect(tables[0].columns).toEqual([
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

        const result = await db.query("select * from metro_interstate_traffic_volume_csv limit 2");

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
                traffic_volume: 45167
            }
        ]);

    });

});
