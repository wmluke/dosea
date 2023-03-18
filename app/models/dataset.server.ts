import type { Prisma } from "@prisma/client";
import { prisma } from "~/db.server";

export type ConnectionType = "sqlite" | "csv";

export interface DatasetInput {
    id?: string;
    name: string;
    type: string;
    connection: string;
    workspaceId: string;
}

export function getDatasetById(id: string) {
    return prisma.dataset.findUnique({
        where: { id },
        include: {
            queries: true
        }
    });
}

export type DatasetWithQueries = Prisma.PromiseReturnType<typeof getDatasetById>;

export function saveDataset({ id, name, type, connection, workspaceId }: DatasetInput) {
    if (id) {
        return prisma.dataset.update({
            data: {
                name, type, connection
            },
            where: { id }
        });
    }
    return prisma.dataset.create({
        data: {
            name,
            type,
            connection,
            workspaceId
        }
    });
}

export function deleteDataset(id: string) {
    return prisma.dataset.delete({ where: { id } });
}
