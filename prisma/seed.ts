import { PrismaClient } from "@prisma/client";
import { getWorkspaces, saveWorkspace } from "~/models/workspace.server";

const prisma = new PrismaClient();

async function seed() {

    const workspaces = await getWorkspaces();
    if (workspaces && workspaces.length > 0) {
        console.log(`Database was already seeded.`);
        return;
    }

    await saveWorkspace({ name: "Default Workspace" });
    console.log(`Database has been seeded. 🌱`);
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
