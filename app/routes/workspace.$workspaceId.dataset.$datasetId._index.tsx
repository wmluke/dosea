import { MagnifyingGlassIcon, RectangleGroupIcon } from "@heroicons/react/24/solid";
import { DatasetQueryNav } from "~/components/dataset-query-nav";
import { DatasetSchema } from "~/components/dataset-schema";
import { useWorkspaceContext } from "~/routes/workspace";

export default function() {
    const { schema, dataset } = useWorkspaceContext();
    return (
        <section id="charts-grid" className="w-full overflow-hidden">
            <div className="flex justify-between mt-6">
                <h3 className="prose text-xl flex gap-2">
                    <MagnifyingGlassIcon className="h-7 w-7" />
                    Queries
                </h3>
            </div>
            <ul className="menu">
                <DatasetQueryNav dataset={dataset} showHeading={false} />
            </ul>
            <div className="flex justify-between mt-6">
                <h3 className="prose text-xl flex gap-2">
                    <RectangleGroupIcon className="w-7 h-7" />
                    Schema
                </h3>
            </div>
            <DatasetSchema schema={schema} />
        </section>
    );
}
