import type { ChartConfig } from "@prisma/client";
import { Link } from "@remix-run/react";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { ChartData } from "~/components/chart";
import { Chart } from "~/components/chart";
import { joinTruthy } from "~/utils";

const ResponsiveGridLayout = WidthProvider(Responsive);

function gridItemLayout(i: number) {
    return {
        x: 0,
        y: i,
        h: 1,
        w: 2,
        i: i + ""
    };
}

export interface ChartsGridProps<T = ChartData> {
    charts?: ChartConfig[];
    queryResult?: T;
}

export function ChartsGrid({ charts, queryResult }: ChartsGridProps) {
    return <ResponsiveGridLayout
        rowHeight={500}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 3, md: 2, sm: 2, xs: 2, xxs: 2 }}
    >
        {charts?.filter(Boolean).map((chart, i) => {
            return (
                <div
                    key={chart!.id}
                    className="card card-compact w-full bg-base-100 shadow-xl"
                    data-grid={gridItemLayout(i)}
                >
                    <Chart data={queryResult ?? []} config={JSON.parse(chart!.configJson)} />

                    <div className="card-body">
                        <div className="card-actions justify-end">
                            <Link
                                reloadDocument
                                to={joinTruthy(["chart", chart!.id], "/")}
                                className="btn-secondary btn-xs btn"
                            >
                                Edit
                            </Link>
                            <Link
                                to={joinTruthy(["chart", chart!.id, "delete"], "/")}
                                className="btn-info btn-xs btn"
                            >
                                Delete
                            </Link>
                        </div>
                    </div>
                </div>
            );
        })}
    </ResponsiveGridLayout>;
}
