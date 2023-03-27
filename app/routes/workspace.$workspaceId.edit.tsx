import { WorkspaceForm } from "~/components/workspace-form";
import { useWorkspaceContext } from "~/routes/workspace";

export default function() {
    const { workspace } = useWorkspaceContext();
    return (
        <WorkspaceForm id={workspace?.id} name={workspace?.name} />
    );
}
