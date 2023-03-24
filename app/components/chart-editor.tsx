import { InformationCircleIcon } from "@heroicons/react/24/solid";
import type { ChangeEvent } from "react";
import { useState } from "react";
import type { ECOption } from "~/components/chart";
import { Chart } from "~/components/chart";
import { isEmpty, useLocalStorage } from "~/utils";

export interface ChartEditorProps {
    data?: any;
    config?: ECOption;
    queryId: string;
    chartId?: string;
    className?: string;
}

const defaultConfig: ECOption = {
    title: {
        text: "Title",
        textStyle: {
            align: "center"
        },
        subtext: "Subtitle",
        subtextStyle: {
            align: "center"
        },
        textAlign: "center",
        left: "50%"
    },
    tooltip: {
        trigger: "axis",
        axisPointer: {
            type: "cross"
        }
    },
    legend: {
        orient: "vertical",
        right: 5
    },
    xAxis: {
        type: "category",
        name: "x-axis name",
        nameLocation: "middle",
        nameGap: 30
    },
    yAxis: {
        type: "value",
        name: "y-axis name",
        nameLocation: "middle",
        nameGap: 40
    },
    series: [
        {
            type: "bar"
        }
    ]
};

export function ChartEditor({ data, config, queryId, chartId, className }: ChartEditorProps) {
    const key = ["chartconfig", queryId, chartId ?? "new"].join(".");
    const [chartConfig, setChartConfig] = useLocalStorage<ECOption>(
        key,
        isEmpty(config) ? { ...defaultConfig } : config!
    );

    const [isValidJson, setValidJson] = useState(true);

    function onChange(e: ChangeEvent<HTMLTextAreaElement>) {
        const { value } = e.target;
        try {
            setChartConfig(JSON.parse(value));
            setValidJson(true);
        } catch (e) {
            console.warn(e);
            setValidJson(false);
        }
    }

    return (
        <div className={className}>
            <figure className="h-[35vh]">
                <Chart data={data} config={chartConfig}></Chart>
            </figure>
            <form method="post">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Chart Config</span>
                        <span className="label-text-alt">
                            <a className="flex gap-1"
                               href="https://echarts.apache.org/en/option.html"
                               target="_blank" rel="noreferrer">
                            <InformationCircleIcon className="h-6 w-6" />
                            ECharts Config
                        </a>
                        </span>
                    </label>
                    <textarea
                        name="configJson"
                        className={`textarea-bordered textarea h-[400px] ${!isValidJson ? "textarea-error" : ""}`}
                        defaultValue={JSON.stringify(chartConfig, null, 4)}
                        onChange={onChange}
                    ></textarea>
                    <label className="label">
                        <span className="label-text"></span>
                        <span className="label-text-alt">JSON</span>
                    </label>

                </div>
                <div className="flex justify-end my-6">
                    <button type="submit" className="btn-primary btn" disabled={!isValidJson}>
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}
