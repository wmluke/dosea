import type { Prisma } from "@prisma/client";
import { prisma } from "~/db.server";

export interface CreateQueryInput {
    id?: string;
    name?: string;
    query: string;
    datasetId: string;
    queryOptionsJson?: string;
}

export function saveQuery({ id, name, query, datasetId, queryOptionsJson }: CreateQueryInput) {
    if (id) {
        return prisma.datasetQuery.update({
            where: { id },
            data: { name: name ?? null, query, queryOptionsJson: queryOptionsJson ?? null }
        });
    }
    return prisma.datasetQuery.create({
        data: { name: name ?? null, query, datasetId, queryOptionsJson: queryOptionsJson ?? null }
    });
}

export function getQueryById(id: string) {
    return prisma.datasetQuery.findUnique({
        where: { id },
        include: {
            dataset: true,
            charts: true
        }
    });
}

export type QueryWithDatasetAndCharts = Prisma.PromiseReturnType<typeof getQueryById>;

export function deleteQuery(id: string) {
    return prisma.datasetQuery.delete({ where: { id } });

}
