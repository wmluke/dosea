import * as echarts from "echarts";
import ReactEChartsCore from "echarts-for-react/lib/core";
// Create an Option type with only the required components and charts via ComposeOption
import type {
    BarSeriesOption,
    LineSeriesOption,
    PieSeriesOption,
    RadarSeriesOption,
    ScatterSeriesOption
} from "echarts/charts";
import type {
    DatasetComponentOption,
    GridComponentOption,
    LegendComponentOption,
    TitleComponentOption,
    TooltipComponentOption
} from "echarts/components";
import { useEffect } from "react";
import { clearTimeout } from "timers";
import { transformData } from "~/components/chart/chart-utils";
import type { QueryResult } from "~/lib/connector/connection.server";

export type ECOption = echarts.ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | PieSeriesOption
    | ScatterSeriesOption
    | RadarSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | DatasetComponentOption
    | LegendComponentOption
>;

export type ChartData = QueryResult;

export interface ChartProps<T = ChartData> {
    data?: T;

    config?: ECOption;

    width?: number;

    datasetType?: string;
}


export function Chart({ data, config, width, datasetType }: ChartProps) {
    const dataset = transformData(data);
    const chartOptions: ECOption = {
        dataset,
        ...(config ?? {})
    };

    //console.log(chartOptions);

    let echartRef: ReactEChartsCore | null = null;

    // kind of lame, but need to resize chart for proper
    // sizing in inside grid react-grid-layout.
    // will likely need to revisit this
    useEffect(() => {
        const timeout = setTimeout(() => {
            echartRef?.getEchartsInstance().resize();
        });
        return () => {
            clearTimeout(timeout);
        };
    });

    return (
        <ReactEChartsCore
            echarts={echarts}
            ref={(e) => {
                echartRef = e;
            }}
            option={chartOptions}
            notMerge={true}
            lazyUpdate={true}
            theme="dark"
            style={{ height: "100% !important", width: width ? `${width}px` : "100% !important" }}
            className="h-full w-full overflow-hidden rounded-lg"
        />
    );
}
