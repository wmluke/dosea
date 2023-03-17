import type { Table } from "~/lib/connector/sqlite";

export interface DatasetSchemaProps {
    tables?: Table[];
}

export function DatasetSchema({ tables }: DatasetSchemaProps) {
    return (
        <>
            <li className="menu-title">
                <span className="text-xl">Tables</span>
            </li>
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
        </>
    );
}
