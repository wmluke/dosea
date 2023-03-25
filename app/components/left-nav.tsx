import { ChevronRightIcon, CircleStackIcon, FolderIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { Link, NavLink } from "@remix-run/react";
import { DatasetQueryNav } from "~/components/dataset-query-nav";
import type { DatasetWithQueries } from "~/models/dataset.server";
import type { WorkspaceWithDatasets } from "~/models/workspace.server";
import type { ConvertDatesToStrings } from "~/utils";
import { classNames } from "~/utils";

export interface LeftNavProps {
    workspace?: ConvertDatesToStrings<WorkspaceWithDatasets>;
    workspaces?: WorkspaceWithDatasets[];
    dataset?: ConvertDatesToStrings<DatasetWithQueries>;
}

export function LeftNav({ workspace, dataset, workspaces }: LeftNavProps) {
    return (
        <ul className="menu menu-compact flex w-80 flex-col bg-base-200 text-base-content p-0 px-4">
            <li>
                <div className="mx-2 flex-1 px-2 text-2xl">
                    {workspace ?
                        <>
                            <FolderIcon className="h-8 w-8" />
                            <Link to={`/workspace/${workspace?.id}`} reloadDocument>{workspace?.name}</Link>
                        </> :
                        <h2>Dosea</h2>
                    }

                </div>
            </li>
            <li tabIndex={0} className="w-[50%]">
                <span>
                    Workspaces
                    <ChevronRightIcon className="w-4 h-4" />
                </span>

                <ul className="p-2 bg-base-100 z-50">
                    {workspaces?.map((w) => {
                        return <li key={w?.id}>
                            <Link to={`/workspace/${w?.id}`} reloadDocument>
                                <FolderIcon className="h-4 w-4" />
                                {w?.name}
                            </Link>
                        </li>;
                    })}
                    <li>
                        <Link to={`/workspace/add`} reloadDocument>
                            <PlusCircleIcon className="h-4 w-4" />
                            New Workspace
                        </Link>
                    </li>
                </ul>
            </li>
            <li className="menu-title">
                <span className="text-xl">Datasets</span>
            </li>
            {workspace?.datasets.map((ds) => {
                return (
                    <li key={ds.id}>
                        <NavLink
                            reloadDocument
                            to={`/workspace/${workspace.id}/dataset/${ds.id}`}
                            className={({ isActive }) => classNames(isActive ? "active" : "", "gap")}
                        >
                            <CircleStackIcon className="h-6 w-6"></CircleStackIcon>
                            {ds.name}
                        </NavLink>
                    </li>
                );
            })}
            {workspace ?
                <li>
                    <NavLink
                        to={`/workspace/${workspace?.id}/dataset/add`}
                        reloadDocument={true}
                        className="no-underline"
                        end
                    >
                        <PlusCircleIcon className="h-6 w-6" />
                        New Dataset
                    </NavLink>
                </li> :
                <></>
            }
            <DatasetQueryNav dataset={dataset} />
            <li className="menu-title">
                <span className="text-xl">Dashboards</span>
            </li>
        </ul>
    );
}
