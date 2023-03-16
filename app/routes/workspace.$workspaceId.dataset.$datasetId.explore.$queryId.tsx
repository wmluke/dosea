import type { ChartConfig, Dataset, DatasetQuery } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
// import GridLayout from "react-grid-layout";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Chart } from "~/components/chart";
import { QueryResultsInspector } from "~/components/queryResultsInspector";
import { connect } from "~/lib/connector/sqlite";
import { getChartConfigsByQueryId } from "~/models/chartconfig.server";
import { getQueryById } from "~/models/query.server";
import { loadDataset } from "~/routes/workspace.$workspaceId.dataset.$datasetId";
import { badRequest, joinTruthy, notFound } from "~/utils";

export interface QueryError {
    code?: string;
    message?: string;
    type?: string;
}

export interface QueryResults<T = Array<Record<string, any>>> {
    dataset: Dataset;
    query: DatasetQuery;
    result?: T;
    charts?: ChartConfig[];
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
}): Promise<Partial<DatasetQuery> | null> {
    if (!queryId) {
        return Promise.resolve({});
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
    const { workspaceId, datasetId, queryId } = params;
    const dataset = await loadDataset(datasetId, workspaceId);
    const query = await loadQuery({ queryId });

    if (!query?.query) {
        return json({ dataset, query } as QueryResults);
    }

    const charts = queryId ? await getChartConfigsByQueryId(queryId) : [];

    const db = await connect(dataset.connection, dataset.type);
    try {
        const result = await db.query(query.query);
        return json({ dataset, query, result, charts } as QueryResults);
    } catch (e: any) {
        console.warn("Dataset Explorer Query Error");
        console.warn(e);
        return json({ dataset, query, error: err(e), charts } as QueryResults);
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
        <>
            <h3 className="prose">Query Results</h3>
            <div className="flex w-full justify-between">
                <QueryResultsInspector result={data.result} error={data.error} className="w-[200px] overflow-hidden" />
                <div className="min-w-[600px] shrink grow overflow-hidden">
                    <Outlet />

                    <ResponsiveGridLayout
                        //width={600}
                        rowHeight={500}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 3, md: 2, sm: 2, xs: 2, xxs: 2 }}
                    >
                        {data.charts?.map((chart, i) => {
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
            </div>
        </>
    );
}
