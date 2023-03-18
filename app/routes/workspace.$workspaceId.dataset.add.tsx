import type { Workspace } from "@prisma/client";
import { useRouteLoaderData } from "react-router";
import { DatasetForm } from "~/components/dataset-form";

type WorkspaceLoader = { workspace: Workspace };

export default function DatasetAddPage() {
    const { workspace } = useRouteLoaderData("routes/workspace.$workspaceId") as WorkspaceLoader;

    return <DatasetForm workspaceId={workspace.id} />;
}
