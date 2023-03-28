import { describe, expect, it } from "vitest";
import type { PromResult } from "~/lib/connector/prometheus.server";
import { convertMatrixResultsToRows } from "~/lib/connector/prometheus.server";


describe("PrometheusConnection", () => {
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
