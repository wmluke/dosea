import type { QueryResult } from "~/lib/connector/connection.server";
import { classNames } from "~/utils";

export interface QueryResultsInspectorProps<T = QueryResult> {
    result?: T | null;
    error?: Object;
    className?: string;
}

export function QueryResultsInspector({ result, error, className }: QueryResultsInspectorProps) {
    const errorClassNames = error ? "bg-error-content bg-error border-error" : "";
    return <pre className={classNames("prose", className, errorClassNames)}>
        {JSON.stringify(result ?? error, null, 2)}
    </pre>;
}
