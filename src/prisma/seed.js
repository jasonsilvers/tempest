const { PrismaClient } = require('@prisma/client');
var faker = require('faker');
const prisma = new PrismaClient();

const DOD_ID = '2223332221';

function createUser(dodId = null) {
  const gender = faker.datatype.number(1);

  return {
    id: faker.datatype.uuid(),
    firstName: faker.name.firstName(gender),
    lastName: faker.name.lastName(gender),
    dodId: dodId
      ? dodId
      : faker.datatype.number({ min: 1000000000, max: 1999999999 }).toString(),
    email: faker.internet.email(),
    dutyTitle:
      faker.company.bsAdjective() +
      ' ' +
      faker.company.bsNoun() +
      ' ' +
      faker.company.bsBuzz(),
    afsc:
      faker.datatype.number({ min: 1, max: 7 }).toString() +
      faker.random.alpha().toLocaleUpperCase() +
      faker.datatype.number({ min: 1, max: 7 }).toString() +
      'X' +
      faker.datatype.number({ min: 1, max: 7 }).toString(),
    rank: 'SSgt/E5',
    address: '15 WG/WSA Tron, Bldg 1102',
  };
}

async function main() {
  const organization1 = await prisma.organization.create({
    data: {
      id: '292bbadf-8f08-49ff-afec-d18b9d84ec07',
      name: '15th MDG',
    },
  });

  const organization2 = await prisma.organization.create({
    data: {
      id: 'd61cc8c2-93eb-41cf-927e-a1fb88a8eead',
      name: 'Dental Squadron',
      parent: {
        connect: { id: organization1.id },
      },
    },
  });

  await prisma.organization.create({
    data: {
      id: '67c6657f-0022-48b0-89b3-866dd89831ef',
      name: 'Vaccinations Squadron',
      parent: {
        connect: { id: organization1.id },
      },
    },
  });

  const role1 = await prisma.role.create({
    data: {
      name: 'admin',
    },
  });

  await prisma.role.create({
    data: {
      name: 'member',
    },
  });

  const resource = await prisma.resource.create({
    data: {
      name: 'record',
    },
  });

  // Permission
  await prisma.grant.create({
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
          name: role1.name,
        },
      },
    },
  });

  await prisma.trackingItem.createMany({
    data: [
      {
        title: 'Fire Extinguisher',
        description: 'This is a AF yearly requirment',
        interval: 365,
      },
      {
        title: 'Supervisor Safety Training',
        description: 'One time training for new supevisors',
        interval: 0,
      },
    ],
  });

  const trackingItem1 = await prisma.trackingItem.create({
    data: {
      title: 'this is a new tracking item',
      description: 'This is the description',
      interval: 30,
    },
  });

  // await prisma.trackingItem.update({
  //   where: {
  //     id: 2384323,
  //   },
  //   data: {
  //     id: trackingItem1.id,
  //     title: 'This is a new title'
  //   },
  // });

  // await prisma.trackingItem.update({
  //   where: {
  //     id: trackingItem1.id,
  //   },
  //   data: {
  //     organizations: {
  //       connect: {
  //         id: organization2.id,
  //       },
  //     },
  //   },
  // });

  const user1 = createUser(DOD_ID);

  await prisma.user.create({
    data: {
      ...user1,
      organizationId: organization1.id,
      roleId: role1.id,
    },
  });

  const user2 = createUser();

  await prisma.user.create({
    data: {
      ...user2,
      organization: {
        connect: {
          id: organization2.id,
        },
      },
      role: {
        connect: {
          id: role1.id,
        },
      },
    },
  });

  const newMemberTrackingItem = {
    userId: user1.id,
    isActive: true,
    trackingItemId: trackingItem1.id,
  };

  const memberTrackingItem = await prisma.memberTrackingItem.create({
    data: newMemberTrackingItem,
  });

  await prisma.memberTrackingRecord.create({
    data: {
      order: 0,
      memberTrackingItems: {
        connect: {
          userId_trackingItemId: {
            userId: memberTrackingItem.userId,
            trackingItemId: memberTrackingItem.trackingItemId,
          },
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
