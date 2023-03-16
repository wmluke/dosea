export interface QueryResultsInspectorProps {
    result?: Object;
    error?: Object;
}

export function QueryResultsInspector({ result, error }: QueryResultsInspectorProps) {
    return <pre className="prose">{JSON.stringify(result ?? error, null, 2)}</pre>;
}
