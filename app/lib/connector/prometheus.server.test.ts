import { describe, expect, it } from "vitest";
import type { PromResult } from "~/lib/connector/prometheus.server";
import { convertMatrixResultsToRows, PrometheusConnection } from "~/lib/connector/prometheus.server";

describe("PrometheusConnection", () => {

    const endpoint = process.env.DOSEA_TEST_DATASET_PROM;

    describe("test", () => {
        it.skipIf(!endpoint)("should return true if the connection was successful", () => {
            const connection = new PrometheusConnection({
                endpoint: endpoint!
            });

            expect(connection.test()).resolves.toBe(true);
        });

        it("should return false if the connection was not successful", () => {
            const connection = new PrometheusConnection({
                endpoint: "http://notavalidendpoint.dev"
            });

            expect(connection.test()).rejects.toEqual({
                status: "error",
                errorType: "unexpected_error",
                error: "unexpected http error"
            });
        });

        it("should throw an error of the connection failed", async () => {
            const connection = new PrometheusConnection({
                endpoint: "http://notavalidendpoint.dev"
            });

            await expect(connection.test()).rejects.toThrow();
        });

    });


    describe("PrometheusDB", () => {

        describe("getSchema", () => {

            it.skipIf(!endpoint)("should describe prometheus metrics, labels, instances, and jobs", async () => {
                const connection = new PrometheusConnection({
                    endpoint: endpoint!
                });
                const db = await connection.connect();
                const promSchema = await db.getSchema();

                expect(promSchema).toBeDefined();
                expect(promSchema.labels?.length).toBeGreaterThan(0);
                expect(promSchema.metrics?.length).toBeGreaterThan(0);
                expect(promSchema.instances?.length).toBeGreaterThan(0);
                expect(promSchema.jobs?.length).toBeGreaterThan(0);
            });

        });
    });


    describe("convertMatrixResultsToTabular", () => {
        it("should convert", () => {
            const json: PromResult = {
                "resultType": "matrix",
                "result": [
                    {
                        "metric": {
                            "name": "node_memory_MemTotal_bytes",
                            "labels": {
                                "instance": "pi4a.kensico.io",
                                "job": "node-exporter"
                            }
                        },
                        "values": [
                            {
                                "time": "2023-03-25T13:13:37.137Z",
                                "value": 8187289600
                            },
                            {
                                "time": "2023-03-26T13:13:37.137Z",
                                "value": 8187289600
                            }
                        ]
                    },
                    {
                        "metric": {
                            "name": "node_memory_MemTotal_bytes",
                            "labels": {
                                "instance": "pi4b.kensico.io",
                                "job": "node-exporter"
                            }
                        },
                        "values": [
                            {
                                "time": "2023-03-25T13:13:37.137Z",
                                "value": 8187289600
                            },
                            {
                                "time": "2023-03-26T13:13:37.137Z",
                                "value": 8187289600
                            }
                        ]
                    }
                ]
            };

            const records = convertMatrixResultsToRows(json);

            expect(records).toHaveLength(2 * 2);
            expect(records).toEqual([
                {
                    "instance": "pi4a.kensico.io",
                    "node_memory_MemTotal_bytes": 8187289600,
                    "time": "2023-03-25T13:13:37.137Z"
                },
                {
                    "instance": "pi4a.kensico.io",
                    "node_memory_MemTotal_bytes": 8187289600,
                    "time": "2023-03-26T13:13:37.137Z"
                },
                {
                    "instance": "pi4b.kensico.io",
                    "node_memory_MemTotal_bytes": 8187289600,
                    "time": "2023-03-25T13:13:37.137Z"
                },
                {
                    "instance": "pi4b.kensico.io",
                    "node_memory_MemTotal_bytes": 8187289600,
                    "time": "2023-03-26T13:13:37.137Z"
                }
            ]);


        });
    });
});
