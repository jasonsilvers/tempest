import { Grant, PrismaClient } from '@prisma/client';
import { EAction, EResource, ERole } from '../const/enums';
import { grants } from '../const/grants';
const casual = require('casual');

const prisma = new PrismaClient();

function getDate(dayOffSet = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - dayOffSet);

  return date;
}

function createUser(firstName?: string, lastName?: string, email?: string) {
  return {
    firstName: firstName ? firstName : casual.first_name,
    lastName: lastName ? lastName : casual.last_name,
    email: email ? email : casual.email,
    dutyTitle: casual.title,
    afsc:
      casual.integer(1, 7).toString() +
      casual.letter.toLocaleUpperCase() +
      casual.integer(1, 7).toString() +
      'X' +
      casual.integer(1, 7).toString(),
    rank: 'SSgt/E5',
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

  const organization3 = await prisma.organization.create({
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
      interval: 90,
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

  const user1 = createUser('Joe', 'Admin', 'joe.admin@gmail.com');

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

  const monitorRole = await prisma.role.findFirst({
    where: {
      name: ERole.MONITOR,
    },
  });

  await prisma.user.create({
    data: {
      ...user1,
      organizationId: organization1.id,
      roleId: adminRole ? adminRole.id : 2,
    },
  });

  const user2 = createUser('Sam', 'Member', 'sam.member@gmail.com');

  const createdUser2 = await prisma.user.create({
    data: {
      ...user2,
      organization: {
        connect: {
          id: organization3.id,
        },
      },
      role: {
        connect: {
          id: memberRole ? memberRole.id : 2,
        },
      },
    },
  });

  const user3 = createUser('Frank', 'Monitor', 'frank.monitor@gmail.com');

  const createdUser3 = await prisma.user.create({
    data: {
      ...user3,
      organization: {
        connect: {
          id: organization1.id,
        },
      },
      role: {
        connect: {
          id: monitorRole ? monitorRole.id : 3,
        },
      },
    },
  });

  const user4 = createUser('Scarlet', 'Member', 'scarlet.member@gmail.com');

  await prisma.user.create({
    data: {
      ...user4,
      organization: {
        connect: {
          id: organization2.id,
        },
      },
      role: {
        connect: {
          id: memberRole ? memberRole.id : 2,
        },
      },
    },
  });

  const newMemberTrackingItem1 = {
    userId: createdUser2.id,
    isActive: true,
    trackingItemId: trackingItem1.id,
  };

  const newMemberTrackingItem2 = {
    userId: createdUser2.id,
    isActive: true,
    trackingItemId: trackingItem2.id,
  };

  const newMemberTrackingItem3 = {
    userId: createdUser2.id,
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
      completedDate: getDate(5),
      authoritySignedDate: getDate(2),
      traineeSignedDate: getDate(2),
      authority: { connect: { id: createdUser3.id } },
      memberTrackingItem: {
        connect: {
          userId_trackingItemId: {
            userId: createdUser2.id,
            trackingItemId: memberTrackingItem1.trackingItemId,
          },
        },
      },
    },
  });

  await prisma.memberTrackingRecord.create({
    data: {
      order: 1,
      completedDate: getDate(5),
      authoritySignedDate: getDate(2),
      traineeSignedDate: getDate(2),
      authority: { connect: { id: createdUser3.id } },
      memberTrackingItem: {
        connect: {
          userId_trackingItemId: {
            userId: createdUser2.id,
            trackingItemId: memberTrackingItem1.trackingItemId,
          },
        },
      },
    },
  });

  await prisma.memberTrackingRecord.create({
    data: {
      order: 1,
      memberTrackingItem: {
        connect: {
          userId_trackingItemId: {
            userId: createdUser2.id,
            trackingItemId: memberTrackingItem2.trackingItemId,
          },
        },
      },
    },
  });

  await prisma.memberTrackingRecord.create({
    data: {
      order: 1,
      memberTrackingItem: {
        connect: {
          userId_trackingItemId: {
            userId: createdUser2.id,
            trackingItemId: memberTrackingItem3.trackingItemId,
          },
        },
      },
    },
  });

  await prisma.memberTrackingRecord.create({
    data: {
      order: 3,
      memberTrackingItem: {
        connect: {
          userId_trackingItemId: {
            userId: createdUser2.id,
            trackingItemId: memberTrackingItem1.trackingItemId,
          },
        },
      },
    },
  });

  await prisma.logEvent.createMany({
    data: [
      {
        logEventType: 'AUTHORIZED',
        message: 'your are authorized',
        userId: createdUser3.id,
      },
      {
        logEventType: 'PAGE_ACCESS',
        message: '/profile',
        userId: createdUser3.id,
      },
    ],
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
