import { CircleStackIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { NavLink } from "@remix-run/react";
import { DatasetQueryNav } from "~/components/dataset-query-nav";
import type { DatasetWithQueries } from "~/models/dataset.server";
import type { WorkspaceWithDatasets } from "~/models/workspace.server";
import { classNames } from "~/utils";

export interface LeftNavProps {
    workspace: WorkspaceWithDatasets;
    dataset?: DatasetWithQueries;
}

export function LeftNav({ workspace, dataset }: LeftNavProps) {
    return (
        <ul className="menu menu menu-compact flex w-80 flex-col bg-base-200 p-0 px-4 text-base-content">
            <li>
                <div className="mx-2 flex-1 px-2 text-3xl">{workspace?.name}</div>
            </li>
            <li className="menu-title">
                <span className="text-xl">Datasets</span>
            </li>
            {workspace?.datasets.map((ds) => {
                return (
                    <li key={ds.id}>
                        <NavLink
                            reloadDocument
                            to={`/workspace/${workspace.id}/dataset/${ds.id}/explore`}
                            className={({ isActive }) => classNames(isActive ? "active" : "", "gap")}
                        >
                            <CircleStackIcon className="h-6 w-6"></CircleStackIcon>
                            {ds.name}
                        </NavLink>
                    </li>
                );
            })}
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
            </li>
            <DatasetQueryNav dataset={dataset} />
            <li className="menu-title">
                <span className="text-xl">Dashboards</span>
            </li>
        </ul>
    );
}
