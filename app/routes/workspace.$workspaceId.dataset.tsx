import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { saveDataset } from "~/models/dataset.server";
import { getWorkspaceById } from "~/models/workspace.server";
import { useWorkspaceContext } from "~/routes/workspace.$workspaceId";
import { badRequest, notFound } from "~/utils";

export async function action({ request, params }: ActionArgs) {
    const workspaceId = params.workspaceId;
    if (!workspaceId) {
        throw notFound();
    }
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace) {
        throw notFound();
    }
    const form = await request.formData();
    const [id, name, type, connection] = [
        form.get("id") as string,
        form.get("name") as string,
        form.get("type") as string,
        form.get("connection") as string
    ];

    if (!name) {
        throw badRequest();
    }

    if (!type) {
        throw badRequest();
    }

    if (!connection) {
        throw badRequest();
    }

    const dataset = await saveDataset({
        id,
        name,
        type,
        connection,
        workspaceId
    });

    return redirect(`/workspace/${workspace.id}/dataset/${dataset.id}/explore`);
}

export default function() {
    const { workspace, dataset, query } = useWorkspaceContext();
    return (
        <Outlet context={{ workspace, dataset, query }} />
    );
}
