import { joinTruthy } from "~/utils";

export interface QueryResultsInspectorProps {
    result?: Object;
    error?: Object;
    className?: string;
}

export function QueryResultsInspector({ result, error, className }: QueryResultsInspectorProps) {
    return (
        <pre className={joinTruthy(["prose text-xs", className], " ")}>{JSON.stringify(result ?? error, null, 2)}</pre>
    );
}
