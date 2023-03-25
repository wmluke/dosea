import type { Table } from "~/lib/connector/connection.server";
import type { PromSchema } from "~/lib/connector/prometheus.server";
import { classNames } from "~/utils";

export interface DatasetSchemaProps {
    tables?: Table[] | PromSchema;
    className?: string;
}

function List({ label, values }: { label: string, values: string[] }) {
    return (
        <ul className="list-none prose mt-0 pl-0 block overflow-hidden overflow-x-scroll">
            <li><h3>{label}</h3></li>
            {values.map((l) => {
                return <li key={l} className="truncate">{l}</li>;
            })}
        </ul>
    );
}

export function DatasetSchema({ tables, className }: DatasetSchemaProps) {
    if (Array.isArray(tables)) {
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
    return (
        <div className="grid grid-cols-2 gap-1">
            <List label="Instances" values={tables?.instances ?? []} />
            <List label="Jobs" values={tables?.jobs ?? []} />
            <List label="Labels" values={tables?.labels ?? []} />
            <List label="Metrics" values={tables?.metrics ?? []} />
        </div>
    );

}
