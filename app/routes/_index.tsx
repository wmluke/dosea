import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { getWorkspaces } from "~/models/workspace.server";

export async function loader(_args: LoaderArgs) {
    const workspaces = await getWorkspaces();
    return json({ workspaces });
}

export default function _index() {
    const { workspaces } = useLoaderData<typeof loader>();
    const [name, setName] = useState<string>();

    function isFormValid() {
        return name?.length;
    }

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold"><span className="text-orange-600">Dosea</span></h1>
                    <p className="py-6">A dosea (daw-see-ey) for your datasets</p>
                    <p className="py-6">Pick a workspace to get started.</p>
                    <ul className="list-none flex flex-col gap-4">
                        {workspaces.map((workspace) => {
                            return <li key={workspace.id}>
                                <Link className="btn btn-info w-full"
                                      to={`/workspace/${workspace.id}`}>{workspace.name}</Link>
                            </li>;
                        })}
                        <li>
                            <form className="w-full" method="post" action="/workspace">
                                <div className="form-control w-full">
                                    <div className="input-group flex justify-between w-full">
                                        <input type="text" placeholder="New Workspace..."
                                               value={name} onChange={(e) => setName(e.target.value)}
                                               required
                                               name="name"
                                               className="input input-bordered grow" />
                                        <button className="btn" disabled={!isFormValid()}>Go</button>
                                    </div>
                                </div>
                            </form>

                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
