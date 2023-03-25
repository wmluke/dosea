import type { Schema } from "~/lib/connector/connection.server";
import { classNames } from "~/utils";

export interface DatasetSchemaProps {
    schema?: Schema;
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

export function DatasetSchema({ schema, className }: DatasetSchemaProps) {
    if (Array.isArray(schema)) {
        return (
            <ul className={classNames("prose", className)}>
                {schema?.map((t) => {
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
            <List label="Instances" values={schema?.instances ?? []} />
            <List label="Jobs" values={schema?.jobs ?? []} />
            <List label="Labels" values={schema?.labels ?? []} />
            <List label="Metrics" values={schema?.metrics ?? []} />
        </div>
    );

}
