import { PrismaClient } from '@prisma/client';
import { main } from './setupSeed';
const prisma = new PrismaClient();

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
