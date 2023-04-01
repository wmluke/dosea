import { InformationCircleIcon } from "@heroicons/react/24/solid";
import type { ChangeEvent } from "react";
import { useState } from "react";
import type { ECOption } from "~/components/chart/chart";
import { isEmpty, useLocalStorage } from "~/utils";

export interface ChartEditorJsonFormProps {
    config?: ECOption;
    queryId: string;
    chartId?: string;
    resetErrorBoundary?: () => void;

}

export function ChartEditorJsonForm({ config, queryId, chartId, resetErrorBoundary }: ChartEditorJsonFormProps) {
    const key = ["chartconfig", queryId, chartId ?? "new"].join(".");
    const [chartConfig, setChartConfig] = useLocalStorage<ECOption>(
        key,
        isEmpty(config) ? {} : config!
    );

    const [isValidJson, setValidJson] = useState(true);

    function onChange(e: ChangeEvent<HTMLTextAreaElement>) {
        const { value } = e.target;
        try {
            setChartConfig(JSON.parse(value));
            setValidJson(true);
            if (resetErrorBoundary) {
                resetErrorBoundary();
            }
        } catch (e) {
            console.warn(e);
            setValidJson(false);
        }
    }

    return (
        <div className="mx-4">
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
