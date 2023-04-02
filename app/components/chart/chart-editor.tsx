import convert from "convert-units";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { FallbackProps } from "react-error-boundary";
import { ErrorBoundary } from "react-error-boundary";
import type { UseFormRegister } from "react-hook-form";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import type { FieldPath } from "react-hook-form/dist/types/path";
import type { ECOption } from "~/components/chart/chart";
import { Chart } from "~/components/chart/chart";
import type { ChartType, Field } from "~/components/chart/chart-utils";
import { createDefaultChartFormValues, createFields, normalizeChartConfig } from "~/components/chart/chart-utils";
import SvgBar from "~/components/icons/bar";
import SvgLine from "~/components/icons/line";
import SvgScatter from "~/components/icons/scatter";


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


export const CHARTFORMVALUES_SCHEMA_VERSION = 1;

export interface ChartFormValues {
    version: number,
    chartType: ChartType;
    title: {
        enabled: boolean,
        title: string,
        subtitle?: string,
    },
    xAxis: {
        label: string;
        fieldId: string
    };
    yAxis: {
        label: string;
        units?: string;
        fieldIds: Array<string>;
    };
    legend: {
        enabled: boolean,
    };
    tooltip: {
        enabled: boolean,
    };
}

type FormSectionProps = {
    heading: string
    children?: ReactNode;
    className?: string
};

function FormSection({ children, heading, className }: FormSectionProps) {
    return (
        <section className={`py-2 ${className}`}>
            <h2 className="text-xl">{heading}</h2>
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
            <table className="table table-compact table-fixed w-full">
                <thead>
                <tr>
                    <th className="max-w-[100px]">Name</th>
                    <th className="hidden md:table-cell">Type</th>
                    <th className="text-center w-[70px]">X-Axis</th>
                    <th className="text-center w-[70px]">Y-Axis</th>
                </tr>
                </thead>
                <tbody>
                {fields.map((f, idx) => {
                    return (
                        <tr key={idx} className="">
                            <td className="align-top truncate">
                                <span>{f.name}</span>
                                <ul className="w-full">
                                    {Object.entries(f.labels ?? {}).map(([l, v], i) => {
                                        return (
                                            <li className="w-full truncate" key={i}>{`${l} = ${v}`}</li>
                                        );
                                    })}
                                </ul>
                            </td>
                            <td className="align-top hidden md:table-cell">{f.type}</td>
                            <td className="text-center">
                                <input type="radio" className="radio radio-primary"
                                       value={idx + ""}
                                       {...register("xAxis.fieldId")}
                                />
                            </td>
                            <td className="text-center">
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

const UNIT_OPTIONS: {
    label: string,
    options: { value: string, label: string }[]
}[] = convert().measures().sort().map((measure) => {
    return {
        label: measure,
        options: convert().list(measure).map(({ measure, plural, abbr, system, singular }) => {
            return {
                value: abbr,
                label: `${plural} (${abbr})`
            };
        })
    };
});

function UnitSelect() {
    const { register } = useFormContext<ChartFormValues>();
    return (
        <select className="select select-bordered" {...register("yAxis.units")}>
            <option value="">Count</option>
            {UNIT_OPTIONS.map((g) => {
                return (
                    <optgroup key={g.label} label={g.label}>
                        {g.options.map((o) => {
                            return (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            );
                        })}
                    </optgroup>
                );
            })}
        </select>
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
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Y-Axis Units</span>
                </label>
                <UnitSelect />
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


export interface ChartEditorFormProps {
    fields: Field[],
    chartConfig?: ChartFormValues;
    onChange: (c: ChartFormValues) => void;
}

export function ChartEditorForm({ fields, chartConfig, onChange }: ChartEditorFormProps) {
    const methods = useForm({
        mode: "onChange",
        defaultValues: chartConfig ?? createDefaultChartFormValues(fields)
    });
    const { register, handleSubmit, watch, setValue } = methods;


    const onSubmit = (data: ChartFormValues) => {
        onChange(data);
    };

    const formValues = watch();

    useEffect(() => {
        const { unsubscribe } = watch((data) => {
            const yAxisFieldIds = data.yAxis?.fieldIds ?? [];
            const xAxisFieldId = data?.xAxis?.fieldId;
            if (xAxisFieldId && yAxisFieldIds.includes(xAxisFieldId)) {
                const ids = yAxisFieldIds.filter(id => id !== xAxisFieldId) ?? [];
                setValue("yAxis.fieldIds", ids as string[]);
            }
            onChange(data as ChartFormValues);
        });
        return () => unsubscribe();
    }, [watch, onChange, fields, setValue]);


    return (
        <div className="grid grid-cols-1 divide-y divide-neutral-800 gap-2">
            <FormProvider {...methods} >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ChartTypeFormSection register={register} />
                    <SeriesFormSection register={register} fields={fields} />
                    <TitleFormSection />
                    <AxisFormSection />
                    <FormSection heading="Legend">
                        <Checkbox label="Enabled" name="legend.enabled" register={register} />
                    </FormSection>
                    <FormSection heading="Tooltip">
                        <Checkbox label="Enabled" name="tooltip.enabled" register={register} />
                    </FormSection>
                </form>
            </FormProvider>
            <form method="post">
                <input type="hidden" name="configJson" value={JSON.stringify(formValues)} readOnly />
                <div className="flex justify-end my-6">
                    <button type="submit" className="btn-primary btn">
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}

export interface ChartEditorProps {
    data?: any;
    config?: ChartFormValues | ECOption;
    queryId: string;
    chartId?: string;
    className?: string;
    datasetType?: string;
}

export function ChartEditor({ data, config, className, datasetType }: ChartEditorProps) {
    const fields = createFields(data);
    const initialChartConfig: ChartFormValues = createDefaultChartFormValues(fields);

    const c = normalizeChartConfig(config);

    const [chartConfig, setChartConfig] = useState<ChartFormValues>(
        c ?? initialChartConfig
    );

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

    function handleFormChange(chartConfig: ChartFormValues) {
        setChartConfig(chartConfig);
        if (_resetErrorBoundary) {
            _resetErrorBoundary();
        }
    }

    return (
        <div className={className}>
            <figure className="h-[45vh]">
                <ErrorBoundary
                    FallbackComponent={Fallback}>
                    <Chart data={data} config={chartConfig} datasetType={datasetType}></Chart>
                </ErrorBoundary>
            </figure>
            <ChartEditorForm fields={fields} chartConfig={chartConfig} onChange={handleFormChange} />
        </div>
    );
}
