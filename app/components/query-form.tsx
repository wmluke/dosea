import type { Dataset, DatasetQuery } from "@prisma/client";
import { useState } from "react";
import { daysAgo, joinTruthy } from "~/utils";

export interface QueryFormProps {
    dataset: Dataset;
    query?: Partial<DatasetQuery> | null;
}

const queryLang: { [type: string]: string } = {
    sqlite: "SQL",
    postgres: "SQL",
    csv: "SQL (Sqlite)",
    prometheus: "PromQL"
};
type PromQLProps = { type?: string, queryOptionsJson?: string | null }

function formatDate(d?: string | number | Date | null): string | undefined {
    if (typeof d === "number") {
        return formatDate(new Date(d as number));
    }
    if (typeof d === "string") {
        return d.split("T")[0];
    }
    return d?.toISOString().split("T")[0];
}

export function PromQLFields({ type, queryOptionsJson }: PromQLProps) {
    const {
        start = daysAgo(7),
        end = new Date(),
        step = "1d"
    } = JSON.parse(queryOptionsJson ?? "{}");

    const [json, setJson] = useState(JSON.stringify({ start, end, step }));

    if (type !== "prometheus") {
        return <></>;
    }

    function onChange(field: string, value: any) {
        const obj = JSON.parse(json);
        switch (field) {
            case "start":
                obj[field] = new Date(value + "T00:00:00.000Z");
                break;
            case "end":
                obj[field] = new Date(value + "T23:59:59.999Z");
                break;
            default:
                obj[field] = value;
                break;
        }
        setJson(JSON.stringify(obj));
    }

    return (
        <div className="form-control">
            <label className="label">
                <span className="label-text">Date Range</span>
            </label>
            <input type="hidden" name="queryOptionsJson" value={json} readOnly={true} />
            <div className="grid grid-cols-3 gap-2">
                <input type="date" defaultValue={formatDate(start)}
                       onChange={(e) => onChange("start", e.target.value)}
                       className="input-bordered input" />
                <input type="date" defaultValue={formatDate(end)}
                       onChange={(e) => onChange("end", e.target.value)}
                       className="input-bordered input" />
                <input type="text"
                       onChange={(e) => onChange("step", e.target.value)}
                       placeholder="step" defaultValue={step}
                       className="input-bordered input" />
            </div>
        </div>
    );
}

export function QueryForm({ dataset, query }: QueryFormProps) {
    const { id, workspaceId, type } = dataset;

    const [q, setQ] = useState(query?.query);

    function isValid() {
        return (q?.length ?? 0) > 0;
    }

    const ql = queryLang[type] ?? "UNKNOWN";
    return (
        <form method="post" action={joinTruthy(["/workspace", workspaceId, "dataset", id, "query"], "/")}>
            <input type="hidden" name="queryId" value={query?.id} />
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Name</span>
                </label>
                <input type="text" name="name" defaultValue={query?.name ?? undefined}
                       placeholder="Name"
                       className="input-bordered input" />
            </div>
            <PromQLFields type={type} queryOptionsJson={query?.queryOptionsJson} />
            <div className="form-control">
                <label className="label">
                    <span className="label-text">{ql}</span>
                    <span className="label-text-alt capitalize">{type}</span>
                </label>
                <textarea
                    name="q"
                    className="textarea-bordered textarea h-24"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    required
                    defaultValue={query?.query}
                    placeholder="Select * FROM..."
                ></textarea>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <button className="btn-primary btn-sm btn gap-2" disabled={!isValid()}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                        />
                    </svg>
                    Run
                </button>
            </div>
        </form>
    );
}
