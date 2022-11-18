import prisma from '../setup/mockedPrisma';
import { MemberTrackingRecord, Organization, Role, User } from '@prisma/client';
import { EMtrVariant, EUserResources } from '../../src/const/enums';
import { getOrganizationAndDown } from '../../src/repositories/organizationRepo';
import {
  createUser,
  deleteUser,
  findTrackingRecordsByAuthorityId,
  findTrackingRecordsByTraineeId,
  findUserByEmail,
  findUserById,
  findUserByIdReturnAllIncludes,
  findUserByIdWithMemberTrackingItems,
  getAllUsersFromUsersOrgCascade,
  getUsers,
  getUsersWithMemberTrackingRecords,
  getUsersWithMemberTrackingRecordsByOrgId,
  updateLastLogin,
  updateUser,
  updateUserRole,
} from '../../src/repositories/userRepo';

import { mockMethodAndReturn } from '../testutils/mocks/repository';

jest.mock('../../src/repositories/organizationRepo.ts');
jest.mock('../../src/repositories/roleRepo');

const commonApiPerson = {
  branch: 'USAF',
  email: 'email@test.jest',
  firstName: 'Bob',
  id: 1234,
  lastName: 'Jones',
  middleName: 'Cory',
  rank: 'SSgt/E-6',
  title: 'Prestigious Jest Mock User',
} as unknown as User;

const mockUser: User = {
  firstName: commonApiPerson.firstName,
  id: commonApiPerson.id,
  afsc: '3D',
  createdAt: new Date(),
  dutyTitle: commonApiPerson.dutyTitle,
  email: commonApiPerson.email,
  lastLogin: new Date(),
  lastName: commonApiPerson.lastName,
  middleName: commonApiPerson.middleName,
  organizationId: 1,
  reportingOrganizationId: 1,
  rank: commonApiPerson.rank,
  roleId: 0,
  updatedAt: new Date(),
};

const mockOrg: Organization = {
  id: 1,
  name: 'test org',
  shortName: 'torg',
  parentId: null,
};

const testOrganizations = [
  {
    id: 1,
    name: 'testOrg1',
  },
  {
    id: 2,
    name: 'testOrg2',
  },
];

afterEach = () => {
  jest.clearAllMocks();
};

const user: User = { ...mockUser };
delete user.id;
test('Repository User Prisma Mock Test for Create', async () => {
  prisma.user.create.mockImplementation(() => mockUser);
  const returnPostUser = await createUser(user as User);
  expect(returnPostUser).toStrictEqual({ ...user, id: 1234 });
});

test('Repository User Prisma Mock Test for Update', async () => {
  prisma.user.update.mockImplementationOnce(() => mockUser);
  const returnPutUser = await updateUser(mockUser.id, mockUser);

  expect(prisma.user.update).toHaveBeenCalledWith({
    data: mockUser,
    where: { id: 1234 },
  });
  expect(returnPutUser).toStrictEqual(mockUser);
});

test('Repository User Prisma Mock Test for Get By Id', async () => {
  prisma.user.findUnique.mockImplementationOnce(() => mockUser);
  const returnIdUser = await findUserById(1234);

  expect(returnIdUser).toStrictEqual(mockUser);
});

test('Repository User Prisma Mock Test for Get By DoD Id', async () => {
  prisma.user.findUnique.mockImplementationOnce(() => mockUser);
  const returnDoDIdUser = await findUserByEmail('1234');
  expect(returnDoDIdUser).toStrictEqual(mockUser);
});

test('should findUserByIdReturnAllIncludes', async () => {
  const spy = prisma.user.findUnique;
  await findUserByIdReturnAllIncludes(1);
  expect(spy).toHaveBeenCalledWith({
    where: {
      id: 1,
    },
    include: {
      role: true,
      organization: true,
      reportingOrganization: true,
      traineeTrackingRecords: {
        include: {
          trackingItem: true,
        },
      },
      authorityTrackingRecords: true,
      memberTrackingItems: {
        include: {
          memberTrackingRecords: {
            include: {
              trackingItem: true,
              authority: true,
              trainee: true,
            },
          },
          trackingItem: true,
          user: true,
        },
      },
    },
  });
});

test('should findUserByIdWithMemberTrackingItems all variant', async () => {
  const spy = prisma.user.findUnique.mockImplementationOnce(() => mockUser);
  const result = await findUserByIdWithMemberTrackingItems(1, EUserResources.MEMBER_TRACKING_ITEMS, EMtrVariant.ALL);
  expect(spy).toHaveBeenCalledWith({
    where: {
      id: 1,
    },
    include: {
      memberTrackingItems: {
        where: {},
        include: {
          trackingItem: true,
          memberTrackingRecords: {
            where: {},
            include: {
              authority: true,
              trackingItem: true,
              trainee: true,
            },
            orderBy: {
              order: 'desc',
            },
          },
        },
      },
    },
  });
  expect(result).toStrictEqual(mockUser);
});

test('should findUserByIdWithMemberTrackingItems completed variant', async () => {
  const spy = prisma.user.findUnique.mockImplementationOnce(() => mockUser);
  const result = await findUserByIdWithMemberTrackingItems(
    1,
    EUserResources.MEMBER_TRACKING_ITEMS,
    EMtrVariant.COMPLETED
  );
  expect(spy).toHaveBeenCalledWith({
    where: {
      id: 1,
    },
    include: {
      memberTrackingItems: {
        where: {
          status: 'ACTIVE',
        },
        include: {
          trackingItem: true,

          memberTrackingRecords: {
            where: { NOT: [{ traineeSignedDate: null }, { authoritySignedDate: null }] },
            include: {
              authority: true,
              trackingItem: true,
              trainee: true,
            },
            orderBy: {
              order: 'desc',
            },
          },
        },
      },
    },
  });
  expect(result).toStrictEqual(mockUser);
});

test('should findUserByIdWithMemberTrackingItems in progress variant', async () => {
  const spy = prisma.user.findUnique.mockImplementationOnce(() => mockUser);
  const result = await findUserByIdWithMemberTrackingItems(
    1,
    EUserResources.MEMBER_TRACKING_ITEMS,
    EMtrVariant.IN_PROGRESS
  );
  expect(spy).toHaveBeenCalledWith({
    where: {
      id: 1,
    },
    include: {
      memberTrackingItems: {
        where: {
          status: 'ACTIVE',
        },
        include: {
          trackingItem: true,
          memberTrackingRecords: {
            where: { OR: [{ traineeSignedDate: null }, { authoritySignedDate: null }] },
            include: {
              authority: true,
              trackingItem: true,
              trainee: true,
            },
            orderBy: {
              order: 'desc',
            },
          },
        },
      },
    },
  });
  expect(result).toStrictEqual(mockUser);
});

test('should getUsers', async () => {
  const spy = prisma.user.findMany;
  await getUsers();
  expect(spy).toHaveBeenCalledWith({
    include: { memberTrackingItems: { include: { memberTrackingRecords: true, trackingItem: true } }, role: true },
  });
});

test('should createUser with role', async () => {
  const spy = prisma.user.create;
  await createUser(user as User, { id: 1, name: 'admin' } as Role);
  expect(spy).toHaveBeenCalledWith({
    data: { ...user, roleId: 1 },
  });
});

test('should updateLastLogin', async () => {
  const spy = prisma.user.update;
  await updateLastLogin(1234);
  expect(spy).toHaveBeenCalled();
});
test('should updateUserRole', async () => {
  prisma.role.findUnique.mockImplementationOnce(() => ({ id: 1, name: 'admin' } as Role));
  const spy = prisma.user.update;
  await updateUserRole(1, 'admin');
  expect(spy).toHaveBeenCalledWith({
    where: { id: 1 },
    data: { roleId: 1 },
    include: {
      role: true,
      organization: true,
      reportingOrganization: true,
    },
  });
});

// Member Tracking Record Stuff

const dummyMemberTrackingRecord = {
  authorityId: 1,
  traineeId: 1,
  id: 1,
  authoritySignedDate: new Date('2019-01-01'),
  traineeSignedDate: new Date('2019-01-01'),
  completedDate: new Date('2019-01-01'),
  createdAt: new Date('2019-01-1'),
  order: 1,
  trackingItemId: 1,
} as MemberTrackingRecord;

test('should findTrackingRecordsByAuthorityId', async () => {
  prisma.memberTrackingRecord.findMany.mockImplementationOnce(() => [dummyMemberTrackingRecord]);
  const result = await findTrackingRecordsByAuthorityId(1);
  expect(result).toStrictEqual([dummyMemberTrackingRecord]);
});

test('should findTrackingRecordsByTraineeId', async () => {
  prisma.memberTrackingRecord.findMany.mockImplementationOnce(() => [dummyMemberTrackingRecord]);
  const result = await findTrackingRecordsByTraineeId(1);
  expect(result).toStrictEqual([dummyMemberTrackingRecord]);
});

test('should return users with member tracking records by org id', async () => {
  const mockResult = {
    ...mockUser,
    organization: mockOrg,
  };

  const spy = prisma.user.findMany.mockImplementationOnce(() => mockResult);

  await getUsersWithMemberTrackingRecordsByOrgId(1);

  expect(spy).toBeCalledWith({
    where: {
      organizationId: 1,
    },
    orderBy: {
      lastName: 'asc',
    },
    include: {
      role: true,
      memberTrackingItems: {
        include: {
          trackingItem: true,
          memberTrackingRecords: {
            orderBy: {
              order: 'desc',
            },
          },
        },
      },
    },
  });
});

test('should return usrs with member trakcing records', async () => {
  const mockResult = {
    ...mockUser,
    organization: mockOrg,
  };

  const spy = prisma.user.findMany.mockImplementationOnce(() => mockResult);

  await getUsersWithMemberTrackingRecords();

  expect(spy).toBeCalledWith({
    orderBy: {
      lastName: 'asc',
    },
    include: {
      role: true,
      memberTrackingItems: {
        include: {
          trackingItem: true,
          memberTrackingRecords: true,
        },
      },
    },
  });
});

test('should return list of organizations and their children', async () => {
  mockMethodAndReturn(getOrganizationAndDown, testOrganizations);
  const mockResult = {
    ...mockUser,
    organization: mockOrg,
  };

  const spy = prisma.user.findMany.mockImplementation(() => mockResult);

  await getAllUsersFromUsersOrgCascade(1);

  expect(spy).toBeCalledWith({
    where: {
      OR: [
        {
          organizationId: {
            in: [1, 2],
          },
        },
        {
          reportingOrganizationId: {
            in: [1, 2],
          },
        },
      ],
    },
    orderBy: {
      lastName: 'asc',
    },
    include: {
      role: true,
      memberTrackingItems: {
        include: {
          trackingItem: true,
          memberTrackingRecords: true,
        },
      },
    },
  });
});

test('should catch error when getting organization tree', async () => {
  const mockedGetOrganizationTree = getOrganizationAndDown as jest.MockedFunction<typeof getOrganizationAndDown>;
  mockedGetOrganizationTree.mockImplementation(() => {
    throw new Error('Test');
  });

  await expect(getAllUsersFromUsersOrgCascade(1)).rejects.toThrowError('There was an error getting organization tree');
});

test('should delete user', async () => {
  const spy = prisma.user.delete;
  await deleteUser(1);
  expect(spy).toBeCalledWith({ where: { id: 1 } });
});
