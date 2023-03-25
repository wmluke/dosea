import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { NavLink } from "@remix-run/react";
import type { DatasetWithQueries } from "~/models/dataset.server";
import type { ConvertDatesToStrings } from "~/utils";
import { classNames, truncate } from "~/utils";

export interface DatasetQueryNavProps {
    dataset?: ConvertDatesToStrings<DatasetWithQueries>;
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
                            to={`/workspace/${dataset.workspaceId}/dataset/${dataset.id}/query/${q.id}`}
                            reloadDocument={true}
                            className="no-underline"
                        >
                            <MagnifyingGlassIcon className="h-6 w-6" />
                            {q.name ?
                                <span>{q.name}</span> :
                                <code className="p-0">{truncate(q.query, 40)}</code>
                            }
                        </NavLink>
                    </li>
                );
            })}
            <li>
                <NavLink
                    to={`/workspace/${dataset?.workspaceId}/dataset/${dataset?.id}/query`}
                    reloadDocument={true}
                    className={classNames("no-underline", dataset?.id ? null : "hidden")}
                    end
                >
                    <PlusCircleIcon className="h-6 w-6" />
                    New Query
                </NavLink>
            </li>
        </>
    );
}
