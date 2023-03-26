import type { ChartData } from "~/components/chart";
import { DatasetSchema } from "~/components/dataset-schema";
import { QueryResultsInspector } from "~/components/query-results-inspector";
import type { Schema } from "~/lib/connector/connection.server";
import type { QueryError } from "~/lib/query.cache";
import { classNames } from "~/utils";

export interface RightPaneProps<T = ChartData> {
    queryResult?: T | null;
    queryError?: QueryError;
    schema?: Schema;
}

export function RightPane({ queryResult, queryError, schema }: RightPaneProps) {
    const emptyQueryResults = !queryResult && !queryError;

    return (
        <div className="flex flex-col">
            <div className={classNames("block overflow-hidden", emptyQueryResults ? "hidden" : "")}>
                <h3 className="prose">Query Results</h3>
                <QueryResultsInspector
                    className="h-full w-[300px] max-h-[60vh] overflow-hidden overflow-y-auto overflow-x-auto text-sm"
                    result={queryResult}
                    error={queryError}
                />
            </div>
            <div className="block overflow-hidden">
                <h3 className="prose">Schema</h3>
                <DatasetSchema schema={schema} className="h-full text-sm" />
            </div>
        </div>
    );
}
