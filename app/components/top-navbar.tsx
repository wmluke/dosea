import { ArrowLeftIcon, Bars3Icon, FolderIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "@remix-run/react";
import type { WorkspaceWithDatasets } from "~/models/workspace.server";
import type { ConvertDatesToStrings } from "~/utils";

export interface TopNavbarProps {
    workspace?: ConvertDatesToStrings<WorkspaceWithDatasets>;
    showBackButton?: boolean;
}

export function TopNavbar({ workspace, showBackButton }: TopNavbarProps) {
    const navigate = useNavigate();
    const goBack = () => navigate(-1);

    return (
        <div className="navbar bg-base-100 xl:hidden">
            <div className="flex-none xl:hidden">
                {showBackButton ?
                    <button className="btn-ghost btn-square btn" onClick={goBack}>
                        <ArrowLeftIcon className="inline-block h-6 w-6 stroke-current" />
                    </button> :
                    <label htmlFor="primary-drawer" className="btn-ghost btn-square btn">
                        <Bars3Icon className="inline-block h-6 w-6 stroke-current" />
                    </label>
                }

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
