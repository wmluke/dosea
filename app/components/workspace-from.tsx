import type { Workspace } from "@prisma/client";
import type { WorkspaceInput } from "~/models/workspace.server";


export function WorkspaceFrom({ name, id }: Partial<WorkspaceInput> & Partial<Pick<Workspace, "id">>) {
    return (
        <div className="prose m-4">
            <h1 className="text-3xl">
                {id ? "Edit Workspace" : "Add Workspace"}
            </h1>
            <form method="post" action="/workspace">
                <input type="hidden" name="id" value={id} />
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Name</span>
                    </label>
                    <input id="input-for-dataset-name" type="text" name="name" defaultValue={name}
                           placeholder="Name"
                           className="input-bordered input" />
                </div>
                <div className="form-control mt-3">
                    <button type="submit" className="btn-primary btn">
                        {id ? "Edit Workspace" : "Add Workspace"}
                    </button>
                </div>
            </form>
        </div>
    );
}
