import { Bars3Icon, FolderIcon } from "@heroicons/react/24/solid";
import { Link } from "@remix-run/react";
import type { WorkspaceWithDatasets } from "~/models/workspace.server";

export interface TopNavbarProps {
    workspace?: WorkspaceWithDatasets;
}

export function TopNavbar({ workspace }: TopNavbarProps) {
    return (
        <div className="navbar bg-base-100 xl:hidden">
            <div className="flex-none xl:hidden">
                <label htmlFor="primary-drawer" className="btn-ghost btn-square btn">
                    <Bars3Icon className="inline-block h-6 w-6 stroke-current" />
                </label>
            </div>
            <div className="mx-2 flex-1 px-2 text-2xl xl:hidden flex gap-1">
                {workspace ?
                    <>
                        <FolderIcon className="h-8 w-8" />
                        <Link to={`/workspace/${workspace?.id}`} reloadDocument>{workspace?.name}</Link>
                    </> :
                    <h3>Dosea</h3>
                }
            </div>
            <div className="flex-none">
                <div className="flex-none lg:hidden">
                    <label htmlFor="secondary-drawer" className="btn-ghost btn-square btn">
                        <Bars3Icon className="inline-block h-6 w-6 stroke-current" />
                    </label>
                </div>
            </div>
        </div>
    );
}
