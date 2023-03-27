import type { Workspace } from "@prisma/client";
import { useState } from "react";
import type { WorkspaceInput } from "~/models/workspace.server";


export function WorkspaceFrom({ name, id }: Partial<WorkspaceInput> & Partial<Pick<Workspace, "id">>) {
    const [name_, setName_] = useState(name);

    function isFormValid() {
        return name_?.length;
    }

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
                    <input id="input-for-dataset-name" type="text" name="name"
                           value={name_} onChange={(e) => setName_(e.target.value)}
                           required
                           defaultValue={name}
                           placeholder="Name"
                           className="input-bordered input" />
                </div>
                <div className="form-control mt-3">
                    <button type="submit" className="btn-primary btn" disabled={!isFormValid()}>
                        {id ? "Edit Workspace" : "Add Workspace"}
                    </button>
                </div>
            </form>
        </div>
    );
}
