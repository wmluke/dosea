import { InformationCircleIcon } from "@heroicons/react/24/solid";
import type { OptionAxisType } from "echarts/types/src/coord/axisCommonTypes";
import type { DataStoreDimensionType } from "echarts/types/src/data/DataStore";
import type { DimensionDefinition } from "echarts/types/src/util/types";
import type { RangeVector } from "prometheus-query/dist/types";
import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import type { FallbackProps } from "react-error-boundary";
import { ErrorBoundary } from "react-error-boundary";
import type { UseFormRegister } from "react-hook-form";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import type { FieldPath } from "react-hook-form/dist/types/path";
import type { ChartData, ECOption } from "~/components/chart";
import { Chart, isPGResult, isPromResult, isSqliteResult } from "~/components/chart";
import SvgBar from "~/components/icons/bar";
import SvgLine from "~/components/icons/line";
import SvgScatter from "~/components/icons/scatter";
import { classNames, isEmpty, isISODateStringLike, useLocalStorage } from "~/utils";


export interface ChartEditorProps {
    data?: any;
    config?: ECOption;
    queryId: string;
    chartId?: string;
    className?: string;
    datasetType?: string;
}

interface Field extends DimensionDefinition {
    id: string;
    labels?: { [l: string]: string };
    datasetIndex: number;
}


function inspectFirstRow(row: Object = {}): Field[] {
    const datasetIndex = 0;
    return Object.entries(row).map(([name, value], idx) => {
        const id = idx + "";
        if (isISODateStringLike(value)) {
            return { id, name, datasetIndex, type: "time" };
        }
        if (typeof value === "string") {
            return { id, name, datasetIndex, type: "ordinal" };
        }
        if (typeof value === "number") {
            return { id, name, datasetIndex, type: "number" };
        }
        return { id, name, datasetIndex };
    }) ?? [];
}


function createFields(data?: ChartData): Field[] {
    if (isSqliteResult(data)) {
        return inspectFirstRow(data[0]);
    }
    if (isPGResult(data)) {
        return inspectFirstRow(data.rows[0]);
    }
    if (isPromResult(data)) {
        const fields: Field[] = data.result.map((r: RangeVector, index) => {
            const { name = "aggregation", labels } = r.metric;
            const { instance } = labels as Field["labels"] ?? {};
            const { type } = inspectFirstRow(r.values[0])[1];
            return {
                id: (index + 1) + "",
                name: instance,
                type,
                labels: {
                    metric: name,
                    ...labels
                },
                datasetIndex: index
            };
        });
        fields.unshift({
            id: "0",
            name: "time",
            type: "time",
            datasetIndex: -1
        });
        return fields;
    }
    console.warn("Failed to determine chart data result type");
    return [];
}

const chartTypes: { type: ChartType, icon: ReactNode }[] = [
    {
        type: "line",
        icon: <SvgLine />
    },
    {
        type: "bar",
        icon: <SvgBar />
    },
    {
        type: "scatter",
        icon: <SvgScatter />
    }
    // {
    //     type: "pie",
    //     icon: <SvgPie />
    // },
    // {
    //     type: "radar",
    //     icon: <SvgRadar />
    // }
];

export interface ChartEditorFormProps {
    data: ChartData;
    onChange: (c: ECOption) => void;
}

interface ChartFormValues {
    chartType: ChartType;
    // fields: Field[];
    title: {
        enabled: boolean,
        title: string,
        subtitle: string,
    },
    xAxis: {
        label: string;
        fieldId: string
    };
    yAxis: {
        label: string;
        fieldIds: Array<string>;
    };
    legend: {
        enabled: boolean,
    };
    tooltip: {
        enabled: boolean,
    };
}

export type ChartType = "bar" | "line" | "pie" | "scatter" | "radar";

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
        const field = fields[Number(id)];
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
        orient: "vertical"
    };

    const tooltip: ECOption["tooltip"] = {
        show: chartFormValues.tooltip.enabled,
        trigger: "axis",
        axisPointer: {
            type: "cross"
        }
    };

    return { title, legend, tooltip, xAxis, yAxis, series };
}

type FormSectionProps = {
    heading: string
    children?: ReactNode;
    className?: string
};

function FormSection({ children, heading, className }: FormSectionProps) {
    return (
        <section className={`py-2 ${className}`}>
            <h3>{heading}</h3>
            <fieldset>
                {children}
            </fieldset>
        </section>
    );
}

type ChartTypeFormSectionProps = {
    register: UseFormRegister<ChartFormValues>
};

function ChartTypeFormSection({ register }: ChartTypeFormSectionProps) {
    return (
        <FormSection heading="Chart Type">
            <div className="grid grid-flow-col auto-cols-max gap-4 text-xl">
                {chartTypes.map(({ type, icon }) => {
                    const id = type + "ChartType";
                    return (
                        <div key={id}>
                            <input id={id} type="radio" value={type}
                                   {...register("chartType", { required: true })}
                                   className="chart-type-radio hidden" />
                            <label htmlFor={id}
                                   className="flex gap-2 items-center p-2 rounded">
                                {icon}
                                <span className="capitalize">{type}</span>
                            </label>
                        </div>
                    );
                })}
            </div>
        </FormSection>
    );
}

type SeriesFormSectionProps = {
    fields: Field[];
    register: UseFormRegister<ChartFormValues>
}

function SeriesFormSection({ fields, register }: SeriesFormSectionProps) {
    const { watch } = useFormContext();
    const xAxisFieldId = watch("xAxis.fieldId");

    return (
        <FormSection heading="Series">
            <table className="table table-compact w-full">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Labels</th>
                    <th>Type</th>
                    <th>X-Axis</th>
                    <th>Y-Axis</th>
                </tr>
                </thead>
                <tbody>
                {fields.map((f, idx) => {
                    return (
                        <tr key={idx} className="">
                            <td className="align-top">{f.name}</td>
                            <td className="align-top">
                                <ul>
                                    {Object.entries(f.labels ?? {}).map(([l, v], i) => {
                                        return (
                                            <li key={i}>{`${l} = ${v}`}</li>
                                        );
                                    })}
                                </ul>
                            </td>
                            <td className="align-top">{f.type}</td>
                            <td>
                                <input type="radio" className="radio radio-primary"
                                       value={idx + ""}
                                       {...register("xAxis.fieldId")}
                                />
                            </td>
                            <td>
                                <input type="checkbox" className="checkbox checkbox-primary"
                                       value={idx + ""}
                                       {...register("yAxis.fieldIds")}
                                       disabled={(f.id + "") === xAxisFieldId}
                                />
                            </td>
                        </tr>

                    );
                })}

                </tbody>
            </table>
        </FormSection>
    );
}

function TitleFormSection() {
    const { register } = useFormContext<ChartFormValues>();
    return (
        <FormSection heading="Title">
            <Checkbox label="Enabled" name="title.enabled" register={register} />
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Title</span>
                </label>
                <input type="text"
                       placeholder="Title"
                       className="input-bordered input"
                       {...register("title.title")} />
            </div>
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Subtitle</span>
                </label>
                <input type="text"
                       placeholder="Title"
                       className="input-bordered input"
                       {...register("title.subtitle")} />
            </div>
        </FormSection>
    );
}

function AxisFormSection() {
    const { register } = useFormContext();
    return (
        <FormSection heading="Axis">
            <div className="form-control">
                <label className="label">
                    <span className="label-text">X-Axis Label</span>
                </label>
                <input type="text"
                       className="input-bordered input"
                       {...register("xAxis.label")} />
            </div>
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Y-Axis Label</span>
                </label>
                <input type="text"
                       className="input-bordered input"
                       {...register("yAxis.label")} />
            </div>
        </FormSection>
    );
}

type CheckboxProps = {
    name: FieldPath<ChartFormValues>;
    label: string;
    register: UseFormRegister<ChartFormValues>;
}

function Checkbox({ name, label, register }: CheckboxProps) {
    return (
        <label className="label flex justify-start gap-2">
            <input type="checkbox"
                   className="checkbox checkbox-primary"
                   {...register(name)} />
            <span className="label-text">{label}</span>
        </label>
    );
}


export function ChartEditorForm({ data, onChange }: ChartEditorFormProps) {
    const fields = createFields(data);
    const xAxisField = fields.find(f => f.type === "time") ?? fields[0] ?? {};

    const initialChartConfig: ChartFormValues = {
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

    const methods = useForm({
        mode: "onChange",
        defaultValues: initialChartConfig
    });
    const { register, handleSubmit, watch, setValue } = methods;


    const onSubmit = (data: ChartFormValues) => {
        onChange(createEChartConfig(data, fields));
    };

    useEffect(() => {
        const { unsubscribe } = watch((data) => {
            const yAxisFieldIds = data.yAxis?.fieldIds ?? [];
            const xAxisFieldId = data?.xAxis?.fieldId;
            if (xAxisFieldId && yAxisFieldIds.includes(xAxisFieldId)) {
                const ids = yAxisFieldIds.filter(id => id !== xAxisFieldId) ?? [];
                setValue("yAxis.fieldIds", ids as string[]);
            }
            onChange(createEChartConfig(data as ChartFormValues, fields));
        });
        return () => unsubscribe();
    }, [watch, onChange, fields, setValue]);


    return (
        <div className="mx-4 grid grid-cols-1 divide-y divide-neutral-800 gap-2">
            <FormProvider {...methods} >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ChartTypeFormSection register={register} />
                    <SeriesFormSection register={register} fields={fields} />
                    <AxisFormSection />
                    <TitleFormSection />
                    <FormSection heading="Legend">
                        <Checkbox label="Enabled" name="legend.enabled" register={register} />
                    </FormSection>
                    <FormSection heading="Tooltip">
                        <Checkbox label="Enabled" name="tooltip.enabled" register={register} />
                    </FormSection>
                </form>
            </FormProvider>
        </div>
    );
}

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


export function ChartEditor({ data, config, queryId, chartId, className, datasetType }: ChartEditorProps) {
    const [chartConfig, setChartConfig] = useState<ECOption>(
        isEmpty(config) ? {} : config!
    );

    const [tab, setTab] = useState("series");
    let _resetErrorBoundary: () => void;

    function Fallback({ error, resetErrorBoundary }: FallbackProps) {
        _resetErrorBoundary = resetErrorBoundary;
        return (
            <div role="alert">
                <p>Something went wrong:</p>
                <pre style={{ color: "red" }}>{error.message}</pre>
            </div>
        );
    }


    function makeTabContent() {
        switch (tab) {
            case "series":
                return <ChartEditorForm data={data} onChange={setChartConfig} />;
            case "advanced":
                return <ChartEditorJsonForm config={chartConfig} chartId={chartId} queryId={queryId}
                                            resetErrorBoundary={_resetErrorBoundary} />;
        }
    }

    const tabContent = makeTabContent();

    return (
        <div className={className}>
            <figure className="h-[35vh]">
                <ErrorBoundary
                    FallbackComponent={Fallback}>
                    <Chart data={data} config={chartConfig} datasetType={datasetType}></Chart>
                </ErrorBoundary>
            </figure>
            <div className="tabs">
                <button className={classNames("tab tab-lifted", tab === "series" ? "tab-active" : "")}
                        onClick={() => setTab("series")}>Editor
                </button>
                <button className={classNames("tab tab-lifted", tab === "advanced" ? "tab-active" : "")}
                        onClick={() => setTab("advanced")}>JSON
                </button>
            </div>
            {tabContent}
        </div>
    );
}
