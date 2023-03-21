import { DatasetForm } from "~/components/dataset-form";
import { useWorkspaceContext } from "~/routes/workspace.$workspaceId";
import { notFound } from "~/utils";

export default function DatasetAddPage() {
    const { workspace } = useWorkspaceContext();
    if (!workspace) {
        throw notFound();
    }

    return <DatasetForm workspaceId={workspace.id} />;
}
