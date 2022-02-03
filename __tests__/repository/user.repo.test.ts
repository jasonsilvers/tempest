import prisma from '../setup/mockedPrisma';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  findTrackingRecordsByAuthorityId,
  findTrackingRecordsByTraineeId,
  findUserByIdReturnAllIncludes,
  findUserByIdWithMemberTrackingItems,
  findUsers,
  getUsers,
  updateLastLogin,
  updateUserRole,
} from '../../src/repositories/userRepo';
import { MemberTrackingRecord, Role, User } from '@prisma/client';
import { IPerson } from '../../src/repositories/common/types';
import { EUserIncludes } from '../../src/const/enums';

const commonApiPerson = {
  address: '123 Fake St',
  branch: 'USAF',
  dodid: '123456789',
  dutyPhone: '568-897-6548',
  dutyTitle: 'duty title',
  email: 'email@test.jest',
  firstName: 'Bob',
  id: 1234,
  lastName: 'Jones',
  middleName: 'Cory',
  phone: '568-897-6548',
  rank: 'SSgt/E-6',
  title: 'Prestigious Jest Mock User',
} as IPerson;

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
  organizationId: '1',
  rank: commonApiPerson.rank,
  roleId: 0,
  updatedAt: new Date(),
};

afterAll = () => {
  jest.clearAllMocks();
};

const user: User = { ...mockUser };
delete user.id;
test('Repository User Prisma Mock Test for Create', async () => {
  prisma.user.create.mockImplementationOnce(() => mockUser);
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

test('should findUserByIdWithMemberTrackingItems', async () => {
  const spy = prisma.user.findUnique.mockImplementationOnce(() => mockUser);
  const result = await findUserByIdWithMemberTrackingItems(1, EUserIncludes.TRACKING_ITEM);
  expect(spy).toHaveBeenCalledWith({
    where: {
      id: 1,
    },
    include: {
      memberTrackingItems: {
        include: {
          trackingItem: true,
        },
      },
    },
  });
  expect(result).toStrictEqual(mockUser);
});

test('should findUsers', async () => {
  const spy = prisma.user.findMany;
  await findUsers();
  expect(spy).toHaveBeenCalledWith({
    include: {
      role: true,
      organization: true,
    },
  });
});

test('should getUsers', async () => {
  const spy = prisma.user.findMany;
  await getUsers();
  expect(spy).toHaveBeenCalledWith();
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
