import { prisma } from "~/db.server";

export interface CreateQueryInput {
    id?: string;
    name?: string;
    query: string;
    datasetId: string;
}

export function saveQuery({ id, name, query, datasetId }: CreateQueryInput) {
    if (id) {
        return prisma.datasetQuery.update({
            where: { id },
            data: { name: name ?? null, query },
        });
    }
    return prisma.datasetQuery.create({
        data: { name: name ?? null, query, datasetId },
    });
}

export function getQueryById(id: string) {
    return prisma.datasetQuery.findUnique({ where: { id } });
}

export function getQueriesByDatasetId(datasetId: string) {
    return prisma.datasetQuery.findMany({
        where: {
            datasetId,
        },
    });
}
