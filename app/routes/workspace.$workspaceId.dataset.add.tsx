import type { Workspace } from "@prisma/client";
import { redirect } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/server-runtime";
import { useRouteLoaderData } from "react-router";
import type { ConnectionType } from "~/models/dataset.server";
import { createDataset } from "~/models/dataset.server";
import { getWorkspaceById } from "~/models/workspace.server";
import { badRequest, notFound } from "~/utils";

type WorkspaceLoader = { workspace: Workspace };

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
    const [name, type, connection] = [
        form.get("name") as string,
        form.get("type") as ConnectionType,
        form.get("connection") as string,
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

    await createDataset({ name, type, connection, workspaceId });

    return redirect(`/workspace/${workspace.id}`);
}

export default function DatasetAddPage() {
    const { workspace } = useRouteLoaderData("routes/workspace.$workspaceId") as WorkspaceLoader;

    return (
        <div className="prose">
            <h1 className="text-3xl">Add Dataset</h1>
            <form method="post">
                <input type="hidden" name="workspaceId" value={workspace.id} />

                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Name</span>
                    </label>
                    <input type="text" name="name" placeholder="Name" className="input-bordered input" />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Type</span>
                    </label>
                    <select name="type" className="select-bordered select w-full max-w-xs">
                        <option value="sqlite">Sqlite</option>
                        <option value="csv">CSV</option>
                    </select>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Connection</span>
                    </label>
                    <input type="text" name="connection" placeholder="connection" className="input-bordered input" />
                </div>

                <div className="form-control">
                    <button type="submit" className="btn-primary btn">
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
}
