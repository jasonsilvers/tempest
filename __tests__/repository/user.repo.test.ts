import prisma from '../setup/mockedPrisma';
import { createUser, findUserByDodId, findUserById, updateUser } from '../../src/repositories/userRepo';
import { User } from '@prisma/client';

const mockUser: Partial<User> = { firstName: 'Bob', dodId: '1234', id: '1' };

afterAll = () => {
  jest.clearAllMocks();
};

const user: Partial<User> = { firstName: 'Bob', dodId: '1234' };
test('Repository User Prisma Mock Test for Create', async () => {
  prisma.user.create.mockImplementationOnce(() => mockUser);
  const returnPostUser = await createUser(user as User);

  expect(returnPostUser).toStrictEqual({ ...user, id: '1' });
});

test('Repository User Prisma Mock Test for Update', async () => {
  prisma.user.update.mockImplementationOnce(() => mockUser);
  const returnPutUser = await updateUser({ ...user, id: '1' } as User);

  expect(prisma.user.update).toHaveBeenCalledWith({
    data: { ...user, id: '1' },
    where: { id: '1' },
  });
  expect(returnPutUser).toStrictEqual({ ...user, id: '1' });
});

test('Repository User Prisma Mock Test for Get By Id', async () => {
  prisma.user.findUnique.mockImplementationOnce(() => mockUser);
  const returnIdUser = await findUserById('1');

  expect(returnIdUser).toStrictEqual({ ...user, id: '1' });
});

test('Repository User Prisma Mock Test for Get By DoD Id', async () => {
  prisma.user.findUnique.mockImplementationOnce(() => mockUser);
  const returnDoDIdUser = await findUserByDodId('1234');

  expect(returnDoDIdUser).toStrictEqual({ ...user, id: '1' });
});
