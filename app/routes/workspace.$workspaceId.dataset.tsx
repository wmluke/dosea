import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { connect } from "~/lib/connector/connection.server";
import { saveDataset } from "~/models/dataset.server";
import { getWorkspaceById } from "~/models/workspace.server";
import { badRequest, err, notFound } from "~/utils";

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

    await connect(dataset.connection, dataset.type);

    return redirect(`/workspace/${workspace.id}/dataset/${dataset.id}/query`);
}

export const handle = {
    primaryDrawerOpen: true
};

export default function() {
    return (
        <Outlet />
    );
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);
    const json = JSON.stringify(err(error), null, 2);
    return (
        <>
            <div className="flex min-h-screen flex-1 flex-col items-center justify-center py-4 prose">
                <h1>Sorry, something went wrong.</h1>
                <pre className="w-[400px]">{json}</pre>
            </div>
        </>
    );
}
