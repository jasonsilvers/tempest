import prisma from '../setup/mockedPrisma';
import {
  createUser,
  findUserByDodId,
  findUserById,
  updateUser,
} from '../../src/prisma/repositories/user';
import { User } from '@prisma/client';
// import prisma from '../../src/prisma/prisma';

const mockUser = { name: 'Bob', dodId: '1234', id: 1 };

afterAll = () => {
  jest.clearAllMocks();
};

const user = { name: 'Bob', dodId: '1234' };
test('Repository User Prisma Mock Test for Create', async () => {
  prisma.user.create.mockImplementationOnce(() => mockUser);
  const returnPostUser = await createUser(user as User);

  expect(returnPostUser).toStrictEqual({ ...user, id: 1 });
});

test('Repository User Prisma Mock Test for Update', async () => {
  prisma.user.update.mockImplementationOnce(() => mockUser);
  const returnPutUser = await updateUser({ ...user, id: 1 } as User);

  expect(returnPutUser).toStrictEqual({ ...user, id: 1 });
});

test('Repository User Prisma Mock Test for Get By Id', async () => {
  prisma.user.findUnique.mockImplementationOnce(() => mockUser);
  const returnIdUser = await findUserById(1);

  expect(returnIdUser).toStrictEqual({ ...user, id: 1 });
});

test('Repository User Prisma Mock Test for Get By DoD Id', async () => {
  prisma.user.findUnique.mockImplementationOnce(() => mockUser);
  const returnDoDIdUser = await findUserByDodId('1234');

  expect(returnDoDIdUser).toStrictEqual({ ...user, id: 1 });
});
