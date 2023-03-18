import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getWorkspaces } from "~/models/workspace.server";

export async function loader(_args: LoaderArgs) {
    const workspaces = await getWorkspaces();
    return json({ workspaces });
}

export default function _index() {
    const { workspaces } = useLoaderData<typeof loader>();
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold"><span className="text-orange-600">Dosea</span></h1>
                    <p className="py-6">A dosea (doh-see-yah) for your datasets</p>
                    <p className="py-6">Pick a workspace to get started.</p>
                    <ul className="list-none">

                        {workspaces.map((workspace) => {
                            return <li key={workspace.id}>
                                <Link className="btn btn-info"
                                      to={`/workspace/${workspace.id}`}>{workspace.name}</Link>
                            </li>;
                        })}

                    </ul>


                </div>
            </div>
        </div>
    );
}
