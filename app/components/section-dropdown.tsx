import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import type { PropsWithChildren } from "react";
import { Children } from "react";

export interface SectionDropdownProps {
}

export function SectionDropdown({ children }: PropsWithChildren<SectionDropdownProps>) {
    return (
        <div className="dropdown dropdown-hover dropdown-left z-50">
            <label tabIndex={0} className="btn btn-xs btn-square btn-info">
                <EllipsisHorizontalIcon className="w-6 h-6" />
            </label>
            <ul tabIndex={0}
                className="dropdown-content menu bg-base-200 base-content p-2 shadow rounded-box w-[150px] z-50">
                {Children.map(children, (child) => {
                    return (
                        <li>{child}</li>
                    );
                })}
            </ul>
        </div>
    );
}
