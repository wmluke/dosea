import { RectangleGroupIcon } from "@heroicons/react/24/solid";
import { DatasetSchema } from "~/components/dataset-schema";
import { useWorkspaceContext } from "~/routes/workspace";

export default function() {
    const { schema } = useWorkspaceContext();
    return (
        <section id="charts-grid" className="w-full overflow-hidden">
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
