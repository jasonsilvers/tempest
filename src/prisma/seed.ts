import { Grant, OrganizationType, PrismaClient, User } from '@prisma/client';
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
    rank: 'SSgt/E-5',
  };
}

async function addUserToDb(user: Partial<User>, organizationId: number, roleId: number) {
  return prisma.user.create({
    data: {
      ...user,
      organizationId,
      roleId,
    },
  });
}

async function createRandomUser(organizationId: number, roleId: number) {
  const newUser = createUser();
  return addUserToDb(newUser, organizationId, roleId);
}

async function createOrganization(name: string, shortName: string, parentId?: number, type?: OrganizationType) {
  const connection = parentId ? { parent: { connect: { id: parentId } } } : null;

  return prisma.organization.create({
    data: {
      name,
      shortName,
      types: [type],
      ...connection,
    },
  });
}

async function addPPEItem(userId: number) {
  return prisma.personalProtectionEquipmentItem.create({
    data: {
      name: casual.title,
      inUse: casual.boolean,
      inUseDetails: casual.short_description,
      provided: casual.boolean,
      providedDetails: casual.short_description,
      userId,
    },
  });
}

async function createOrganizationStructure() {
  const mdg = await createOrganization('15th Medical Group', '15th MDG', null, 'CATALOG');
  const lrs = await createOrganization('LRS', 'LRS', null, 'CATALOG');
  const omrs = await createOrganization('15 Operation Medical Readiness Squadron', '15 OMRS', mdg.id);
  const hcos = await createOrganization('15 Healthcare Operation Squadron', '15 HCOS', mdg.id);
  const execStaff = await createOrganization('15th Medical Group Executive Staff', '15th MDG Exc Staff', mdg.id);
  const mdss = await createOrganization('15 Medical Support Squadron', '15 MDSS', mdg.id);

  //OMRS Flights
  await createOrganization('Aerospace Medicine', 'Aerospace Medicine', omrs.id);
  await createOrganization('Bioenviromental Engineering', 'Bioenviromental Engineering', omrs.id);
  await createOrganization('Dental', 'Dental', omrs.id);
  await createOrganization('Public Health', 'Public Health', omrs.id);
  await createOrganization('Active Duty Clinic', 'Active Duty Clinic', omrs.id);
  await createOrganization('Physical Therapy', 'Physical Therapy', omrs.id);
  await createOrganization('Mental Health/ADAPT', 'Mental Health/ADAPT', omrs.id);

  //HCOS Flights
  await createOrganization('Clinical Medicine', 'Clinical Medicine', hcos.id);
  await createOrganization('Ohana Clinic', 'Ohana Clinic', hcos.id);

  //MDSS Flights
  const pharmacy = await createOrganization('Pharmacy', 'Pharmacy', mdss.id, 'CATALOG');
  await createOrganization('Diagnostics and Therapeutics ', 'D&T', mdss.id);
  await createOrganization('Readiness', 'Readiness', mdss.id);
  await createOrganization('Medical Logistics', 'Medical Logistics', mdss.id);
  await createOrganization('Resource Management Office', 'Resource Management Office', mdss.id);
  await createOrganization('Tricare operations and patient administration', 'TOPA', mdss.id);
  await createOrganization('Information Systems Flight', 'Information Systems Flight', mdss.id);
  await createOrganization('Faculty Managers', 'Faculty Managers', mdss.id);

  return [mdg, omrs, execStaff, pharmacy, lrs];
}

async function seedDev() {
  const [mdg, omrs, execStaff, pharmacy, lrs] = await createOrganizationStructure();

  await prisma.trackingItem.createMany({
    data: [
      {
        title: 'GLOBAL - Fire Extinguisher',
        description: 'This is a AF yearly requirment',
        interval: 365,
      },
      {
        title: 'GLOBAL - Supervisor Safety Training',
        description: 'One time training for new supevisors',
        interval: 0,
      },
      {
        title: 'LRS - Check your gloves',
        description: 'One time training for new supevisors',
        interval: 0,
        organizationId: lrs.id,
      },
      {
        title: 'MDG - shoom too fast',
        description: 'One time training for new supevisors',
        interval: 0,
        organizationId: mdg.id,
      },
      {
        title: 'PHARMACY - Paper cuts',
        description: 'No paper cuts',
        interval: 0,
        organizationId: pharmacy.id,
      },
    ],
  });

  const trackingItem1 = await prisma.trackingItem.create({
    data: {
      title: 'GLOBAL - Fire Safety',
      description: 'How to be SAFE when using Fire',
      interval: 90,
    },
  });

  const trackingItem2 = await prisma.trackingItem.create({
    data: {
      title: 'PHARMACY - Big Bug Safety',
      description: 'There are big bugs in Hawaii!  Be careful!',
      interval: 365,
      organizationId: pharmacy.id,
    },
  });

  const trackingItem3 = await prisma.trackingItem.create({
    data: {
      title: 'GLOBAL - Keyboard Warrior Training',
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
      organizationId: mdg.id,
      roleId: adminRole ? adminRole.id : 2,
    },
  });

  for (let i = 0; i <= 200; i++) {
    await createRandomUser(mdg.id, memberRole ? memberRole.id : 2);
  }

  const user2 = createUser('Sam', 'Member', 'sam.member@gmail.com');

  const createdUser2 = await addUserToDb(user2, execStaff.id, memberRole ? memberRole.id : 2);

  await addPPEItem(createdUser2.id);
  await addPPEItem(createdUser2.id);
  await addPPEItem(createdUser2.id);
  await addPPEItem(createdUser2.id);

  const user3 = createUser('Frank', 'Monitor', 'frank.monitor@gmail.com');

  const createdUser3 = await prisma.user.create({
    data: {
      ...user3,
      organization: {
        connect: {
          id: mdg.id,
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
          id: omrs.id,
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

    trackingItemId: trackingItem1.id,
  };

  const newMemberTrackingItem2 = {
    userId: createdUser2.id,

    trackingItemId: trackingItem2.id,
  };

  const newMemberTrackingItem3 = {
    userId: createdUser2.id,

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
