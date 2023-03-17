import type { Prisma } from "@prisma/client";
import { prisma } from "~/db.server";

export type ConnectionType = "sqlite" | "csv";

export interface DatasetInput {
    name: string;
    type: ConnectionType;
    connection: string;
    workspaceId: string;
}

export function getDatasetById(id: string) {
    return prisma.dataset.findUnique({
        where: { id },
        include: {
            queries: true,
        },
    });
}

export type DatasetWithQueries = Prisma.PromiseReturnType<typeof getDatasetById>;

export function createDataset({ name, type, connection, workspaceId }: DatasetInput) {
    return prisma.dataset.create({
        data: {
            name,
            type,
            connection,
            workspaceId,
        },
    });
}
