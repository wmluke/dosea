import { prisma } from "~/db.server";

export interface CreateQueryInput {
    id?: string;
    name?: string;
    query: string;
    datasetId: string;
}

export function saveQuery({ id, name, query, datasetId }: CreateQueryInput) {
    return prisma.query.upsert({
        create: { name, query, datasetId },
        update: { id, name, query },
        where: { id },
    });
}

export function getQueryById(id: string) {
    return prisma.query.findUnique({ where: { id } });
}

export function getQueriesByDatasetId(datasetId: string) {
    return prisma.query.findMany({
        where: {
            datasetId,
        },
    });
}
