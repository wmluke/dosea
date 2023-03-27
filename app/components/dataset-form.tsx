import { useState } from "react";
import type { DatasetInput } from "~/models/dataset.server";


export function DatasetForm(dataset: Partial<DatasetInput> & { workspaceId: string }) {
    const [name, setName] = useState(dataset?.name);
    const [connection, setConnection] = useState(dataset?.connection);

    function isFormValid() {
        return name?.length && connection?.length;
    }

    return (
        <div className="prose m-4">
            <h1 className="text-3xl">
                {dataset.id ? "Edit Dataset" : "Add Dataset"}
            </h1>
            <form method="post" action={["/workspace", dataset.workspaceId, "dataset"].join("/")}>
                <input type="hidden" name="id" value={dataset.id} />
                <input type="hidden" name="worksiteId" value={dataset.workspaceId} />
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Name</span>
                    </label>
                    <input id="input-for-dataset-name" type="text" name="name"
                           value={name} onChange={(e) => setName(e.target.value)}
                           required
                           placeholder="Name"
                           className="input-bordered input" />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Type</span>
                    </label>
                    <select id="select-for-dataset-type" name="type" defaultValue={dataset.type}
                            className="select-bordered select w-full max-w-xs">
                        <option value="sqlite">Sqlite</option>
                        <option value="postgres">Postgres</option>
                        <option value="csv">CSV</option>
                        <option value="prometheus">Prometheus</option>
                    </select>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Connection</span>
                    </label>
                    <input id="input-for-dataset-connection" type="text" name="connection"
                           value={connection} onChange={(e) => setConnection(e.target.value)}
                           required
                           placeholder="connection"
                           className="input-bordered input" />
                </div>
                <div className="form-control mt-3">
                    <button type="submit" className="btn-primary btn" disabled={!isFormValid()}>
                        {dataset.id ? "Edit Dataset" : "Add Dataset"}
                    </button>
                </div>
            </form>
        </div>
    );
}
