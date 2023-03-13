export default function DatasetAddPage() {
    return (
        <div className="prose">
            <h1 className="text-3xl">Add Dataset</h1>
            <form method="post">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Name</span>
                    </label>
                    <input type="text" name="name" placeholder="Name" className="input input-bordered"/>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Type</span>
                    </label>
                    <select name="type" className="select select-bordered w-full max-w-xs">
                        <option value="sqlite">Sqlite</option>
                        <option value="csv">CSV</option>
                    </select>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Connection</span>
                    </label>
                    <input type="text" name="connection" placeholder="connection" className="input input-bordered"/>
                </div>
            </form>
        </div>
    );
}
