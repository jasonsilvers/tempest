import { User } from '.prisma/client';
import {
  createUser,
  findUserByDodId,
  findUserById,
  updateUser,
} from '../../src/prisma/repositories/user';

const mockUser: Partial<User> = { name: 'Bob', dodId: '1234', id: 1 };
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: function () {
      return {
        user: {
          findUnique: () => mockUser,
          create: () => mockUser,
          update: () => mockUser,
        },
      };
    },
  };
});

afterAll = () => {
  jest.clearAllMocks();
};

const user: Partial<User> = { name: 'Bob', dodId: '1234' };
test('Repository User Prisma Mock Test for Create', async () => {
  const returnPostUser = await createUser(user as User);

  expect(returnPostUser).toStrictEqual({ ...user, id: 1 });
});

test('Repository User Prisma Mock Test for Update', async () => {
  const returnPutUser = await updateUser({ ...user, id: 1 } as User);

  expect(returnPutUser).toStrictEqual({ ...user, id: 1 });
});

test('Repository User Prisma Mock Test for Get By Id', async () => {
  const returnIdUser = await findUserById(1);

  expect(returnIdUser).toStrictEqual({ ...user, id: 1 });
});

test('Repository User Prisma Mock Test for Get By DoD Id', async () => {
  const returnDoDIdUser = await findUserByDodId('1234');

  expect(returnDoDIdUser).toStrictEqual({ ...user, id: 1 });
});
