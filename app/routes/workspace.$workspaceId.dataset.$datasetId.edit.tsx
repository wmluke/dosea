import { DatasetForm } from "~/components/dataset-form";
import { useWorkspaceContext } from "~/routes/workspace.$workspaceId";

export default function DatasetEditPage() {
    const { dataset } = useWorkspaceContext();

    return <DatasetForm id={dataset?.id}
                        workspaceId={dataset?.workspaceId!}
                        name={dataset?.name}
                        type={dataset?.type}
                        connection={dataset?.connection} />;
}
