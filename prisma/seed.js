const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const organization = await prisma.organization.create({
    data: {
      name: 'test',
    },
  });

  const role = await prisma.role.create({
    data: {
      name: 'admin',
      organization: {
        connect: { id: organization.id },
      },
    },
  });

  const resource = await prisma.resource.create({
    data: {
      name: 'record',
    },
  });

  const permission = await prisma.grant.create({
    data: {
      action: 'create:any',
      attributes: '*',
      resourceModel: {
        connect: {
          name: resource.name,
        },
      },
      roleModel: {
        connect: {
          name: role.name,
        },
      },
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'bob anderson',
      dodId: '2223332221',
      email: 'bob.anderson@gmail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      Organization: {
        connect: {
          id: organization.id,
        },
      },
      role: {
        connect: {
          id: role.id,
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
