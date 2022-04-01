const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();

  console.log(users);

  for (const user of users) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        organization: {
          connect: {
            id: user.organizationId,
          },
        },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
