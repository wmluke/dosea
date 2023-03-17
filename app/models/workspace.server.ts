import type { Prisma } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getWorkspaceById(id: string) {
    return prisma.workspace.findUnique({ where: { id }, include: { datasets: true } });
}

export type WorkspaceWithDatasets = Prisma.PromiseReturnType<typeof getWorkspaceById>;

export async function getWorkspaces() {
    return prisma.workspace.findMany({
        include: {
            datasets: true,
        },
    });
}

export async function createWorkspace({ name }: { name: string }) {
    return prisma.workspace.create({ data: { name } });
}
