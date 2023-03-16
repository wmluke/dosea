import type { Table } from "~/lib/connector/sqlite";

export interface DatasetSchemaProps {
    tables: Table[];
}

export function DatasetSchema({ tables }: DatasetSchemaProps) {
    return (
        <ul>
            {tables.map((t) => {
                return (
                    <li key={t.name}>
                        {t.name}
                        <ul>
                            {t.columns.map((c) => {
                                return (
                                    <li key={`${t.name}.${c.name}`}>
                                        {c.name}: {c.type}
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
