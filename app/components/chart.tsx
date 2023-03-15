import ReactEChartsCore from "echarts-for-react/lib/core";
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption } from "echarts/charts";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import type {
    DatasetComponentOption,
    GridComponentOption,
    LegendComponentOption,
    TitleComponentOption,
    TooltipComponentOption
} from "echarts/components";
import { DatasetComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";

// Register the required components
echarts.use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    DatasetComponent,
    BarChart,
    LineChart,
    PieChart,
    SVGRenderer,
]);

// Create an Option type with only the required components and charts via ComposeOption
type ECOption = echarts.ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | DatasetComponentOption
    | LegendComponentOption
    | PieSeriesOption
>;

export interface ChartProps<
    T = Record<string, string | number | boolean | Date>[]
> {
    data: T;
}

export function Chart({ data }: ChartProps) {
    const chartOptions: ECOption = {
        title: {
            text: "Specials, Venues, and Neighborhoods",
            textStyle: {
                align: "center",
            },
            subtext: "Grouped by Day of Week",
            subtextStyle: {
                align: "center",
            },
            textAlign: "center",
            left: "50%",
        },
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "cross" },
        },
        legend: {
            // Try 'horizontal'
            orient: "vertical",
            right: 10,
            // top: "center",
        },
        dataset: {
            dimensions: ["dayofweek", "specials", "venues", "neighborhoods"],
            source: data,
        },
        xAxis: {
            type: "category",
            name: "Day of Week",
            nameLocation: "middle",
            nameGap: 30,
        },
        yAxis: {
            type: "value",
            name: "Count",
            nameLocation: "middle",
            nameGap: 40,
        },
        series: [
            {
                name: "Specials",
                type: "bar",
            },
            {
                name: "Venues",
                type: "line",
            },
            {
                name: "Neighborhoods",
                type: "bar",
            },
        ],
    };

    return (
        <ReactEChartsCore
            echarts={echarts}
            option={chartOptions}
            notMerge={true}
            lazyUpdate={true}
            className="w-full"
        />
    );
}
