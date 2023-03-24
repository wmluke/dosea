import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { LeftNav } from "~/components/left-nav";
import type { PanelMatch } from "~/components/page-layout";
import type { WorkspaceWithDatasets } from "~/models/workspace.server";
import { getWorkspaces } from "~/models/workspace.server";

type LoaderContext = { workspaces: WorkspaceWithDatasets[]; };

export async function loader({ params }: LoaderArgs) {
    const workspaces = await getWorkspaces();
    return json({ workspaces });
}

export const handle: PanelMatch = {
    primaryDrawerOpen: true,
    primaryPanelItem({ workspace, dataset, match }) {
        const { workspaces = [] } = (match.data ?? { workspaces: [] }) as LoaderContext;
        return <LeftNav workspace={workspace} dataset={dataset}
                        workspaces={workspaces.filter(w => w?.id !== workspace?.id)} />;
    }
};

export default function WorkspacePage() {
    return (
        <Outlet />
    );
}

