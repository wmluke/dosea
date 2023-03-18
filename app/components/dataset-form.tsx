import type { DatasetInput } from "~/models/dataset.server";


export function DatasetForm(dataset: Partial<DatasetInput> & { workspaceId: string }) {

    return (
        <div className="prose">
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
                    <input type="text" name="name" defaultValue={dataset.name} placeholder="Name"
                           className="input-bordered input" />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Type</span>
                    </label>
                    <select name="type" defaultValue={dataset.type} className="select-bordered select w-full max-w-xs">
                        <option value="sqlite">Sqlite</option>
                    </select>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Connection</span>
                    </label>
                    <input type="text" name="connection" defaultValue={dataset.connection} placeholder="connection"
                           className="input-bordered input" />
                </div>

                <div className="form-control mt-3">
                    <button type="submit" className="btn-primary btn">
                        {dataset.id ? "Edit Dataset" : "Add Dataset"}
                    </button>
                </div>
            </form>
        </div>
    );
}
