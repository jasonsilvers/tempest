import prisma from '../../src/prisma/prisma';
import {
  createUser,
  findUserByDodId,
  findUserById,
  updateUser,
} from '../../src/prisma/repositories/user';
import { User } from '@prisma/client';

const mockUser = { name: 'Bob', dodId: '1234', id: 1 };

prisma.user = {
  findUnique: () => mockUser,
  create: () => mockUser,
  update: () => mockUser,
};

afterAll = () => {
  jest.clearAllMocks();
};

const user = { name: 'Bob', dodId: '1234' };
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
