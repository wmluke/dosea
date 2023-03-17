import { classNames } from "~/utils";

export interface QueryResultsInspectorProps<T = Array<Record<string, any>>> {
    result?: T | null;
    error?: Object;
    className?: string;
}

export function QueryResultsInspector({ result, error, className }: QueryResultsInspectorProps) {
    return <pre className={classNames("prose", className)}>{JSON.stringify(result ?? error, null, 2)}</pre>;
}
