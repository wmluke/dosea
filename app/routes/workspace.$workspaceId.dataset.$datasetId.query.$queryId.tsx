import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import type { PanelMatch } from "~/components/page-layout";
import { RightPane } from "~/components/right-pane";
import type { QueryError } from "~/lib/query.cache";
import { loadQuery, runQuery } from "~/lib/query.cache";
import type { QueryWithDatasetAndCharts } from "~/models/query.server";

export interface QueryPageLoaderReturn<T = Array<Record<string, any>>> {
    query: QueryWithDatasetAndCharts;
    queryResult: {
        result?: T;
        error?: QueryError;
    };
}

export async function loader({ params }: LoaderArgs) {
    const { datasetId, queryId } = params;
    const query = await loadQuery({ queryId, datasetId });
    const queryResult = await runQuery({ queryId, datasetId }) as any;
    return json({ query, queryResult });
}

export const handle: PanelMatch = {
    secondaryPanelItem({ match, tables }) {
        const { queryResult } = match.data as QueryPageLoaderReturn;
        return (
            <div className="prose">
                <RightPane queryResult={queryResult.result} queryError={queryResult.error} tables={tables} />
            </div>
        );
    }
};

export default function QueryPage() {
    return (
        <Outlet />
    );
}
