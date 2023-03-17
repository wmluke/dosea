import type { Dataset, DatasetQuery } from "@prisma/client";
import { Link } from "@remix-run/react";
import { joinTruthy } from "~/utils";

export interface QueryFormProps {
    dataset: Dataset;
    query?: Partial<DatasetQuery> | null;
    showAddChartButton?: boolean;
}

function AddChartButton({ queryId }: { queryId?: string }) {
    if (!queryId) {
        return <></>;
    }
    return (
        <Link className="btn-secondary btn-sm btn" to={`${queryId}/chart/add`}>
            Add Chart
        </Link>
    );
}

export function QueryForm({ dataset, query, showAddChartButton = true }: QueryFormProps) {
    const { id, workspaceId, type } = dataset;
    return (
        <form method="post" action={joinTruthy(["/workspace", workspaceId, "dataset", id, "explore"], "/")}>
            <input type="hidden" name="queryId" value={query?.id} />
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Query</span>
                    <span className="label-text-alt">{type}</span>
                </label>
                <textarea
                    name="q"
                    className="textarea-bordered textarea h-24"
                    defaultValue={query?.query}
                    placeholder="Select * FROM..."
                ></textarea>
            </div>
            <div className="my-4 flex items-center justify-between">
                <button className="btn-primary btn-sm btn gap-2">
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
                {showAddChartButton ? <AddChartButton queryId={query?.id} /> : ""}
            </div>
        </form>
    );
}
