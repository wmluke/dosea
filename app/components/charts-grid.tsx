import type { ChartConfig } from "@prisma/client";
import { Link } from "@remix-run/react";
import { useMemo } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { ChartData } from "~/components/chart";
import { Chart } from "~/components/chart";
import type { ConvertDatesToStrings } from "~/utils";
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
    charts?: ConvertDatesToStrings<ChartConfig>[];
    queryResult?: T;
    datasetType?: string;
}

export function ChartsGrid({ charts, queryResult, datasetType }: ChartsGridProps) {

    const children = useMemo(() => {
        return charts?.filter(Boolean).map((chart, i) => {
            return (
                <div
                    key={chart!.id}
                    className="card card-compact card-bordered w-full bg-[#100c2a]"
                    data-grid={gridItemLayout(i)}
                >
                    <div className="card-body">

                        <Chart data={queryResult ?? []} config={JSON.parse(chart!.configJson)}
                               datasetType={datasetType} />
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
        });
    }, [charts, queryResult]);

    return <ResponsiveGridLayout
        rowHeight={500}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 3, md: 2, sm: 2, xs: 2, xxs: 2 }}
    >
        {children}
    </ResponsiveGridLayout>;
}
