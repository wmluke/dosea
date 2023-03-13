import {PrismaClient} from '@prisma/client';
import {createWorkspace} from '~/models/workspace.server';

const prisma = new PrismaClient();

async function seed() {
    await createWorkspace({name: 'Default Workspace'});

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
