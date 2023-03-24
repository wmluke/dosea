import { RectangleGroupIcon } from "@heroicons/react/24/solid";
import { DatasetSchema } from "~/components/dataset-schema";
import { useWorkspaceContext } from "~/routes/workspace";

export default function() {
    const { tables } = useWorkspaceContext();
    return (
        // <section className="prose mx-0 px-0 mt-2">
        //     <h2>Schema</h2>
        //
        // </section>

        <section id="charts-grid" className="w-full overflow-hidden">
            <div className="flex justify-between mt-6">
                <h3 className="prose text-xl flex gap-2">
                    <RectangleGroupIcon className="w-7 h-7" />
                    Schema
                </h3>
            </div>
            <DatasetSchema tables={tables} />
        </section>
    );
}
