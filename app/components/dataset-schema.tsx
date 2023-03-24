import type { Table } from "~/lib/connector/connection.server";
import { classNames } from "~/utils";

export interface DatasetSchemaProps {
    tables?: Table[];
    className?: string;
}

export function DatasetSchema({ tables, className }: DatasetSchemaProps) {
    return (
        <ul className={classNames("prose", className)}>
            {tables?.map((t) => {
                return (
                    <li key={t.name} tabIndex={0}>
                        <span>{t.name}</span>
                        <ul className="bg-base-100">
                            {t.columns.map((c) => {
                                return (
                                    <li key={`${t.name}.${c.name}`}>
                                        <span>
                                            {c.name}: {c.type}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </li>
                );
            })}
        </ul>
    );
}
