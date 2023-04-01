import type { DatasetOption } from "echarts/types/dist/shared";
import type { OptionAxisType } from "echarts/types/src/coord/axisCommonTypes";
import type { DataStoreDimensionType } from "echarts/types/src/data/DataStore";
import type { DimensionDefinition } from "echarts/types/src/util/types";
import type { QueryResult as PGQueryResult } from "pg";
import type { QueryResult as PromQueryResult, RangeVector, SampleValue } from "prometheus-query/dist/types";
import type { ChartData, ECOption } from "~/components/chart/chart";
import type { ChartFormValues } from "~/components/chart/chart-editor";
import { CHARTFORMVALUES_SCHEMA_VERSION } from "~/components/chart/chart-editor";
import type { SqliteQueryResult } from "~/lib/connector/sqlite.server";
import { isISODateStringLike } from "~/utils";

export type ResultType = "pg-query" | "sqlite-query" | "prom-query";

export interface Field extends DimensionDefinition {
    id: string;
    labels?: { [l: string]: string };
    datasetIndex: number;
    resultType: ResultType;
}

export type ChartType = "bar" | "line" | "pie" | "scatter" | "radar";

export function isSqliteResult(data?: ChartData): data is SqliteQueryResult {
    return Array.isArray(data);
}

export function isPGResult(data?: ChartData): data is PGQueryResult {
    return Array.isArray((data as PGQueryResult)?.rows);
}

export function isPromResult(data?: ChartData): data is PromQueryResult {
    return Array.isArray((data as PromQueryResult)?.result);
}

export function createEChartDataset(data?: ChartData): DatasetOption | DatasetOption[] {
    if (isSqliteResult(data)) {
        return {
            source: data
        };
    }
    if (isPGResult(data)) {
        return { source: data.rows };
    }
    if (isPromResult(data)) {
        return data.result.map((r: RangeVector) => {
            const { name: metric = "aggregation", labels } = r.metric;
            const { instance } = labels as { instance: string };
            return {
                source: r.values.map((v: SampleValue) => {
                    return {
                        instance,
                        metric,
                        time: v.time,
                        [promFieldName({ metric, instance })]: v.value
                    };
                })
            };
        });
    }
    console.warn("Failed to determine chart data result type");
    return [];
}


function inspectFirstRow(row: Object = {}, resultType: ResultType): Field[] {
    const datasetIndex = 0;
    const entryToField = ([name, value]: [string, string], idx: number): Field => {
        const id = idx + "";
        if (isISODateStringLike(value)) {
            return { id, name, datasetIndex, type: "time", resultType };
        }
        if (typeof value === "string") {
            return { id, name, datasetIndex, type: "ordinal", resultType };
        }
        if (typeof value === "number") {
            return { id, name, datasetIndex, type: "number", resultType };
        }
        return { id, name, datasetIndex, resultType };
    };
    return Object.entries(row).map(entryToField) ?? [];
}

function promFieldName({ metric, instance }: { metric: string, instance: string }): string {
    return `${metric} ${instance}`;
}

export function createFields(data?: ChartData): Field[] {
    if (isSqliteResult(data)) {
        return inspectFirstRow(data[0], "sqlite-query");
    }
    if (isPGResult(data)) {
        return inspectFirstRow(data.rows[0], "pg-query");
    }
    if (isPromResult(data)) {
        const resultType: ResultType = "prom-query";
        const fields: Field[] = data.result.map((r: RangeVector, index): Field => {
            const { name: metric = "aggregation", labels } = r.metric;
            const { instance } = labels as Field["labels"] ?? {};
            const { type } = inspectFirstRow(r.values[0], resultType)[1];
            return {
                id: (index + 1) + "",
                name: promFieldName({ metric, instance }),
                type,
                labels: {
                    metric,
                    ...labels
                },
                datasetIndex: index,
                resultType
            };
        });
        fields.unshift({
            id: "0",
            name: "time",
            type: "time",
            datasetIndex: -1,
            resultType
        });
        return fields;
    }
    console.warn("Failed to determine chart data result type");
    return [];
}

function toAxisType(type?: DataStoreDimensionType): OptionAxisType {
    switch (type) {
        case "time":
            return "time";
        case "ordinal":
            return "category";
        default:
            return "value";
    }
}

export function createEChartConfig(chartFormValues: ChartFormValues, fields: Field[]): ECOption {
    const xAxisField = fields[Number(chartFormValues.xAxis.fieldId)] ?? {};
    const series: ECOption["series"] = chartFormValues.yAxis.fieldIds.map((id) => {
        const field = fields[Number(id)] ?? {};
        return {
            type: chartFormValues.chartType,
            datasetIndex: field.datasetIndex,
            name: field.name,
            // dimensions: [{
            //     name: field.name,
            //     type: field.type,
            //     displayName: field.name
            // }],
            encode: {
                x: xAxisField.name,
                y: field.name
            }
        };
    });

    const xAxis: ECOption["xAxis"] = {
        type: toAxisType(xAxisField.type),
        name: chartFormValues.xAxis.label,
        nameLocation: "middle",
        nameGap: 30
    };

    const yAxis: ECOption["yAxis"] = {
        type: "value",
        name: chartFormValues.yAxis.label,
        nameLocation: "middle",
        nameGap: 40
    };

    const title: ECOption["title"] = {
        show: chartFormValues.title.enabled,
        text: chartFormValues.title.title,
        subtext: chartFormValues.title.subtitle
    };

    const legend: ECOption["legend"] = {
        show: chartFormValues.legend.enabled,
        bottom: 0
    };

    const tooltip: ECOption["tooltip"] = {
        show: chartFormValues.tooltip.enabled,
        trigger: "axis",
        axisPointer: {
            type: "cross"
        }
    };

    const grid: ECOption["grid"] = {
        // bottom: 125,
    };

    return { title, legend, tooltip, xAxis, yAxis, series, grid };
}

function getFirst<T>(itemOrItems: T | T[]): T {
    return Array.isArray(itemOrItems) ? itemOrItems[0] : itemOrItems;
}

function toArray<T>(itemOrItems: T | T[]): T[] {
    return Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
}

export function createChartFormValues(echartOptions: ECOption): ChartFormValues {
    const ecTitle = getFirst(echartOptions.title);
    const ecLegend = getFirst(echartOptions.legend);
    const ecTooltip = getFirst(echartOptions.tooltip);
    const ecXAxis = getFirst(echartOptions.xAxis);
    const ecYAxis = getFirst(echartOptions.yAxis);
    const ecSeries = toArray(echartOptions.series);

    const { type: chartType = "line" } = getFirst(ecSeries) ?? {};

    const title: ChartFormValues["title"] = {
        enabled: ecTitle?.show ?? true,
        title: ecTitle?.text ?? "Chart Title",
        subtitle: ecTitle?.subtext
    };

    const legend: ChartFormValues["legend"] = {
        enabled: ecLegend?.show ?? true
    };

    const tooltip: ChartFormValues["tooltip"] = {
        enabled: ecTooltip?.show ?? true
    };

    const xAxis: ChartFormValues["xAxis"] = {
        label: ecXAxis?.name ?? "x-axis",
        fieldId: "0"
    };

    const yAxis: ChartFormValues["yAxis"] = {
        label: ecYAxis?.name ?? "y-axis",
        fieldIds: Array.from({ length: ecSeries.length }, (_, i) => (i + 1) + "")
    };

    const version = CHARTFORMVALUES_SCHEMA_VERSION;

    return { version, chartType, title, legend, tooltip, xAxis, yAxis };

}

export function createDefaultChartFormValues(fields: Field[]): ChartFormValues {
    const xAxisField = fields.find(f => f.type === "time") ?? fields[0] ?? {};
    return {
        version: CHARTFORMVALUES_SCHEMA_VERSION,
        chartType: "line",
        title: {
            enabled: true,
            title: "Chart Title",
            subtitle: "Chart Subtitle"
        },
        xAxis: {
            label: "x-axis",
            fieldId: xAxisField.id
        },
        yAxis: {
            label: "y-axis",
            fieldIds: fields.map(f => f.id).filter(id => id !== xAxisField.id)
        },
        tooltip: {
            enabled: true
        },
        legend: {
            enabled: true
        }
    };
}

function isChartFromValues(config?: ChartFormValues | ECOption): config is ChartFormValues {
    return (config as ChartFormValues)?.version > 0;
}

export function normalizeChartConfig(config?: ChartFormValues | ECOption) {
    return isChartFromValues(config) ? config : createChartFormValues(config ?? {});
}
