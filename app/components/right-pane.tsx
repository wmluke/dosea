import { DatasetSchema } from "~/components/dataset-schema";
import { QueryResultsInspector } from "~/components/query-results-inspector";
import type { Table } from "~/lib/connector/sqlite";
import type { QueryError } from "~/routes/workspace.$workspaceId.dataset.$datasetId.explore.$queryId";

export interface RightPaneProps<T = Array<Record<string, any>>> {
    queryResult?: T | null;
    queryError?: QueryError;
    tables?: Table[];
}

export function RightPane({ queryResult, queryError, tables }: RightPaneProps) {
    return (
        <div className="flex h-[150vh] flex-col">
            <div className="block h-[75vh] overflow-hidden">
                <h3 className="prose">Query Results</h3>
                <QueryResultsInspector
                    className="h-full w-[300px] overflow-hidden overflow-y-auto overflow-x-auto text-sm"
                    result={queryResult}
                    error={queryError}
                />
            </div>
            <div className="block h-[75vh] overflow-hidden">
                <h3 className="prose">Tables</h3>
                <DatasetSchema tables={tables} className="h-full overflow-hidden overflow-y-auto text-sm" />
            </div>
        </div>
    );
}
