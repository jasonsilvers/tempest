import { Grant, PrismaClient } from '@prisma/client';
import { EAction, EResource, ERole } from '../const/enums';
import { grants } from '../utils/Grants';
const faker = require('faker');

const prisma = new PrismaClient();

const DOD_ID = '2223332221';

function createUser(dodId = null, firstName = null, lastName = null) {
  const gender = faker.datatype.number(1);

  return {
    id: faker.datatype.uuid(),
    firstName: firstName ? firstName : faker.name.firstName(gender),
    lastName: lastName ? lastName : faker.name.lastName(gender),
    dodId: dodId ? dodId : faker.datatype.number({ min: 1000000000, max: 1999999999 }).toString(),
    email: faker.internet.email(),
    dutyTitle: faker.company.bsAdjective() + ' ' + faker.company.bsNoun() + ' ' + faker.company.bsBuzz(),
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

async function seedDev() {
  const organization1 = await prisma.organization.create({
    data: {
      name: '15th MDG',
    },
  });

  const organization2 = await prisma.organization.create({
    data: {
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

  const user1 = createUser(DOD_ID, 'Joe', 'Smith');

  const memberRole = await prisma.role.findFirst({
    where: {
      name: ERole.MEMBER,
    },
  });

  const adminRole = await prisma.role.findFirst({
    where: {
      name: ERole.MONITOR,
    },
  });

  await prisma.user.create({
    data: {
      ...user1,
      organizationId: organization1.id,
      roleId: adminRole.id,
    },
  });

  const user2 = createUser('1143209890', 'Sandra', 'Clark');

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

  const user3 = createUser('2143209891', 'Frank', 'Clark');

  await prisma.user.create({
    data: {
      ...user3,
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

async function seedResources() {
  const resourcesData = Object.values(EResource).map((name) => {
    return { name };
  });

  await prisma.resource.createMany({
    data: resourcesData,
  });
}

async function seedRoles() {
  const rolesData = Object.values(ERole).map((name) => {
    return { name };
  });

  await prisma.role.createMany({
    data: rolesData,
  });
}

async function seedGrants() {
  const baseGrantsData = grants.map((grant) => {
    return {
      action: grant.action,
      attributes: grant.attributes,
      resource: grant.resource,
      role: grant.role,
    } as Grant;
  });

  const adminGrants = Object.values(EResource).map((resource) => {
    return Object.values(EAction).map((action) => {
      return {
        action,
        attributes: '*',
        resource,
        role: ERole.ADMIN,
      } as Grant;
    });
  });

  const adminGrantsData = adminGrants.flat();

  const grantsData = [...baseGrantsData, ...adminGrantsData];

  await prisma.grant.createMany({
    data: grantsData,
  });
}

async function main() {
  await seedResources();
  await seedRoles();
  await seedGrants();
  await seedDev();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
