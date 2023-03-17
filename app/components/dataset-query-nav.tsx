import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { Link, NavLink } from "@remix-run/react";
import type { DatasetWithQueries } from "~/models/dataset.server";
import { truncate } from "~/utils";

export interface DatasetQueryNavProps {
    dataset?: DatasetWithQueries;
}

export function DatasetQueryNav({ dataset }: DatasetQueryNavProps) {
    return (
        <>
            <li className="menu-title">
                <span className="text-xl">Queries</span>
            </li>
            {dataset?.queries.map((q) => {
                return (
                    <li key={q.id}>
                        <NavLink
                            to={`/workspace/${dataset.workspaceId}/dataset/${dataset.id}/explore/${q.id}`}
                            reloadDocument={true}
                            className="no-underline"
                        >
                            <MagnifyingGlassIcon className="h-6 w-6" />
                            <code className="p-0">{truncate(q.query, 40)}</code>
                        </NavLink>
                    </li>
                );
            })}
            <li>
                <Link
                    to={`/workspace/${dataset?.workspaceId}/dataset/${dataset?.id}/explore`}
                    reloadDocument={true}
                    className="no-underline"
                >
                    <PlusCircleIcon className="h-6 w-6" />
                    New Query
                </Link>
            </li>
        </>
    );
}
