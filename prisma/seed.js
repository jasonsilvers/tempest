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
      accessControlName: 'admin',
      displayName: 'admin',
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
          accessControlName: role.accessControlName,
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
      Role: {
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
