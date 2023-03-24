import type { Prisma } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getWorkspaceById(id: string) {
    return prisma.workspace.findUnique({ where: { id }, include: { datasets: true } });
}

export type WorkspaceWithDatasets = Prisma.PromiseReturnType<typeof getWorkspaceById>;

export async function getWorkspaces(includeDatasets = false) {
    return prisma.workspace.findMany({
        include: {
            datasets: includeDatasets
        }
    });
}

export interface WorkspaceInput {
    id?: string;
    name: string;
}

export async function saveWorkspace({ id, name }: WorkspaceInput) {
    if (id) {
        return prisma.workspace.update({
            data: { name },
            where: { id }
        });
    }
    return prisma.workspace.create({ data: { name } });
}
