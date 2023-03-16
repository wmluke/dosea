import ReactECharts from "echarts-for-react";
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption } from "echarts/charts";
import type {
    DatasetComponentOption,
    GridComponentOption,
    LegendComponentOption,
    TitleComponentOption,
    TooltipComponentOption
} from "echarts/components";
import type * as echarts from "echarts/core";

// Create an Option type with only the required components and charts via ComposeOption
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
        <ReactECharts
            option={chartOptions}
            notMerge={true}
            lazyUpdate={true}
            className="min-h-[200px] w-full min-w-[300px]"
        />
    );
}
