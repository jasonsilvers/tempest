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

  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
    },
  });

  const memberRole = await prisma.role.create({
    data: {
      name: 'member',
    },
  });

  const userResource = await prisma.resource.create({
    data: {
      name: 'user',
    },
  });

  await prisma.grant.create({
    data: {
      action: 'read:any',
      attributes: '*',
      resourceModel: {
        connect: {
          name: userResource.name,
        },
      },
      roleModel: {
        connect: {
          name: adminRole.name,
        },
      },
    },
  });

  await prisma.grant.create({
    data: {
      action: 'read:own',
      attributes: '*',
      resourceModel: {
        connect: {
          name: userResource.name,
        },
      },
      roleModel: {
        connect: {
          name: memberRole.name,
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
      title: 'Fire Safety',
      description: 'How to be SAFE when using Fire',
      interval: 60,
    },
  });

  const trackingItem2 = await prisma.trackingItem.create({
    data: {
      title: 'Big Bug Safety',
      description: 'There are big bugs in Hawaii!  Be careful!',
      interval: 365,
    },
  });

  const trackingItem3 = await prisma.trackingItem.create({
    data: {
      title: 'Keyboard Warrior Training',
      description: 'How to be a true keyboard warrior via writing code',
      interval: 180,
    },
  });

  const user1 = createUser(DOD_ID);

  await prisma.user.create({
    data: {
      ...user1,
      organizationId: organization1.id,
      roleId: memberRole.id,
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
          id: memberRole.id,
        },
      },
    },
  });

  const newMemberTrackingItem1 = {
    userId: user1.id,
    isActive: true,
    trackingItemId: trackingItem1.id,
  };

  const newMemberTrackingItem2 = {
    userId: user1.id,
    isActive: true,
    trackingItemId: trackingItem2.id,
  };

  const newMemberTrackingItem3 = {
    userId: user1.id,
    isActive: true,
    trackingItemId: trackingItem3.id,
  };

  const memberTrackingItem1 = await prisma.memberTrackingItem.create({
    data: newMemberTrackingItem1,
  });

  const memberTrackingItem2 = await prisma.memberTrackingItem.create({
    data: newMemberTrackingItem2,
  });

  const memberTrackingItem3 = await prisma.memberTrackingItem.create({
    data: newMemberTrackingItem3,
  });

  await prisma.memberTrackingRecord.create({
    data: {
      order: 2,
      completedDate: faker.date.recent(20).toISOString(),
      authoritySignedDate: faker.date.recent(15).toISOString(),
      traineeSignedDate: faker.date.recent(18).toISOString(),
      authority: { connect: { id: user2.id } },
      memberTrackingItems: {
        connect: {
          userId_trackingItemId: {
            userId: user1.id,
            trackingItemId: memberTrackingItem1.trackingItemId,
          },
        },
      },
    },
  });

  await prisma.memberTrackingRecord.create({
    data: {
      order: 1,
      completedDate: faker.date.recent(20).toISOString(),
      authoritySignedDate: faker.date.recent(15).toISOString(),
      traineeSignedDate: faker.date.recent(18).toISOString(),
      authority: { connect: { id: user2.id } },
      memberTrackingItems: {
        connect: {
          userId_trackingItemId: {
            userId: user1.id,
            trackingItemId: memberTrackingItem1.trackingItemId,
          },
        },
      },
    },
  });

  await prisma.memberTrackingRecord.create({
    data: {
      order: 1,
      memberTrackingItems: {
        connect: {
          userId_trackingItemId: {
            userId: user1.id,
            trackingItemId: memberTrackingItem2.trackingItemId,
          },
        },
      },
    },
  });

  await prisma.memberTrackingRecord.create({
    data: {
      order: 1,
      memberTrackingItems: {
        connect: {
          userId_trackingItemId: {
            userId: user1.id,
            trackingItemId: memberTrackingItem3.trackingItemId,
          },
        },
      },
    },
  });

  await prisma.memberTrackingRecord.create({
    data: {
      order: 3,
      memberTrackingItems: {
        connect: {
          userId_trackingItemId: {
            userId: user1.id,
            trackingItemId: memberTrackingItem1.trackingItemId,
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
