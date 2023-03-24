import { WorkspaceFrom } from "~/components/workspace-from";
import { useWorkspaceContext } from "~/routes/workspace";

export default function() {
    const { workspace } = useWorkspaceContext();
    return (
        <WorkspaceFrom id={workspace?.id} name={workspace?.name} />
    );
}
