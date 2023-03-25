import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useRouteLoaderData } from "@remix-run/react";
import type { PanelMatch } from "~/components/page-layout";
import { RightPane } from "~/components/right-pane";
import type { QueryError } from "~/lib/query.cache";
import { runQuery } from "~/lib/query.cache";

export interface QueryPageLoaderReturn<T = Array<Record<string, any>>> {
    queryResult: {
        result?: T;
        error?: QueryError;
    };
}

export async function loader({ params }: LoaderArgs) {
    const { datasetId, queryId } = params;
    const queryResult = await runQuery({ queryId, datasetId }) as any;
    return json({ queryResult });
}

export function useQueryLayoutLoaderData() {
    return useRouteLoaderData("routes/workspace.$workspaceId.dataset.$datasetId.query.$queryId") as QueryPageLoaderReturn;
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

export default function QueryLayout() {
    return (
        <Outlet />
    );
}
