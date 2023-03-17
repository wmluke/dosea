import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Chart } from "~/components/chart";
import { connect } from "~/lib/connector/sqlite";
import type { QueryWithDatasetAndCharts } from "~/models/query.server";
import { getQueryById } from "~/models/query.server";
import { badRequest, joinTruthy, notFound } from "~/utils";

export interface QueryError {
    code?: string;
    message?: string;
    type?: string;
}

export interface QueryResults<T = Array<Record<string, any>>> {
    query: QueryWithDatasetAndCharts;
    result?: T;
    error?: QueryError;
}

function err(e: any): QueryError {
    return {
        code: e?.code,
        message: e?.message,
        type: e?.name ?? typeof e,
    };
}

export async function loadQuery({
    queryId,
    datasetId,
}: {
    queryId?: string;
    datasetId?: string;
}): Promise<QueryWithDatasetAndCharts> {
    if (!queryId) {
        return Promise.resolve(null);
    }
    const query = await getQueryById(queryId);
    if (!query) {
        throw notFound();
    }
    if (datasetId && query.datasetId !== datasetId) {
        throw badRequest();
    }
    return query;
}

export async function loader({ params }: LoaderArgs) {
    const { datasetId, queryId } = params;
    const query = await loadQuery({ queryId, datasetId });

    const db = await connect(query!.dataset.connection, query!.dataset.type);
    try {
        const result = await db.query(query!.query);
        return json({ query, result } as QueryResults);
    } catch (e: any) {
        console.warn("Dataset Explorer Query Error");
        console.warn(e);
        return json({ query, error: err(e) } as QueryResults);
    } finally {
        await db.close();
    }
}

const ResponsiveGridLayout = WidthProvider(Responsive);

function gridItemLayout(i: number) {
    return {
        x: 0,
        y: i,
        h: 1,
        w: 2,
        i: i + "",
    };
}

export default function QueryPage() {
    const data = useLoaderData<typeof loader>();
    return (
        <div className="w-full overflow-hidden">
            <Outlet />
            <ResponsiveGridLayout
                rowHeight={500}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 3, md: 2, sm: 2, xs: 2, xxs: 2 }}
            >
                {data.query?.charts?.map((chart, i) => {
                    return (
                        <div
                            key={chart.id}
                            className="card card-compact w-full bg-base-100 shadow-xl"
                            data-grid={gridItemLayout(i)}
                        >
                            <Chart data={data.result ?? []} config={JSON.parse(chart.configJson)} />

                            <div className="card-body">
                                <div className="card-actions justify-end">
                                    <Link
                                        to={joinTruthy(["chart", chart.id], "/")}
                                        className="btn-secondary btn-xs btn"
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        to={joinTruthy(["chart", chart.id, "delete"], "/")}
                                        className="btn-info btn-xs btn"
                                    >
                                        Delete
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </ResponsiveGridLayout>
        </div>
    );
}
