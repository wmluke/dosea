import * as echarts from "echarts";
import ReactEChartsCore from "echarts-for-react/lib/core";

// Create an Option type with only the required components and charts via ComposeOption
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption } from "echarts/charts";
import type {
    DatasetComponentOption,
    GridComponentOption,
    LegendComponentOption,
    TitleComponentOption,
    TooltipComponentOption
} from "echarts/components";

export type ECOption = echarts.ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | DatasetComponentOption
    | LegendComponentOption
    | PieSeriesOption
>;

export interface ChartProps<T = Record<string, string | number | boolean | Date>[]> {
    data?: T;

    config?: ECOption;
}

export function Chart({ data, config }: ChartProps) {
    const chartOptions: ECOption = {
        dataset: {
            source: data,
        },
        ...(config ?? {}),
    };
    return (
        <ReactEChartsCore
            echarts={echarts}
            option={chartOptions}
            notMerge={true}
            lazyUpdate={true}
            style={{ height: "100% !important" }}
            className="h-full w-full overflow-hidden"
        />
    );
}
