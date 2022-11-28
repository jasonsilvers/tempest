import { User } from '@prisma/client';
import mergeUserAccountApiHandler from '../../../src/pages/api/account/merge';
import { findGrants } from '../../../src/repositories/grantsRepo';
import {
  deleteUser,
  findUserByEmail,
  FindUserById,
  findUserById,
  updateUser,
} from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { adminJWT, memberJWT } from '../../testutils/mocks/mockJwt';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { testNextApi } from '../../testutils/NextAPIUtils';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/grantsRepo');

const mockedFindByUserId = findUserById as jest.MockedFunction<typeof findUserById>;
const mockedUpdateUser = updateUser as jest.MockedFunction<typeof updateUser>;

const globalUserId = 1;

const userFromDb = {
  id: globalUserId,
  firstName: 'joe',
  lastName: 'anderson',
  email: 'winninganderson@gmail.com',
} as unknown as FindUserById;

const secondUserAccountFromDb = {
  id: 2,
  firstName: 'joe',
  lastName: 'anderson',
  email: 'losinganderson2@gmail.com',
} as unknown as FindUserById;

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('Merge User Account', () => {
  test('Should merge account and delete the loser account', async () => {
    mockedFindByUserId.mockResolvedValueOnce(userFromDb).mockResolvedValueOnce(secondUserAccountFromDb);

    mockedUpdateUser
      .mockResolvedValueOnce({
        ...secondUserAccountFromDb,
        email: `Archive_${secondUserAccountFromDb?.email}`,
      } as unknown as User)
      .mockResolvedValueOnce({ ...userFromDb, email: 'winninganderson@gmail.com' } as unknown as User);
    mockMethodAndReturn(deleteUser, secondUserAccountFromDb);

    const { status, data } = await testNextApi.post(mergeUserAccountApiHandler, {
      customHeaders: { Authorization: `Bearer ${adminJWT}` },
      body: {
        winningAccountId: userFromDb?.id,
        losingAccountId: secondUserAccountFromDb?.id,
      },
    });

    expect(mockedUpdateUser).toHaveBeenNthCalledWith(1, 2, { email: `Archive_${secondUserAccountFromDb?.email}` });
    expect(mockedUpdateUser).toHaveBeenNthCalledWith(2, 1, { email: secondUserAccountFromDb?.email });

    expect(status).toBe(200);
    expect(data).toStrictEqual({ message: 'ok' });
  });

  test('Should return 405 for method not allowed', async () => {
    const { status } = await testNextApi.get(mergeUserAccountApiHandler);
    expect(status).toBe(405);
  });

  test('should return 403, when non-admin tries to merge', async () => {
    const { status } = await testNextApi.post(mergeUserAccountApiHandler, {
      customHeaders: { Authorization: `Bearer ${memberJWT}` },
      body: {
        winningAccountId: userFromDb?.id,
        losingAccountId: secondUserAccountFromDb?.id,
      },
    });
    expect(status).toBe(403);
  });

  test('should return 500, when error occurs', async () => {
    mockMethodAndReturn(findUserById, userFromDb);
    const errorMsg = 'There was a problem merging the accounts, unable to update losing account, please try again.';
    mockedUpdateUser.mockImplementation(() => {
      throw new Error(errorMsg);
    });

    const { status, data } = await testNextApi.post(mergeUserAccountApiHandler, {
      customHeaders: { Authorization: `Bearer ${adminJWT}` },
      body: {
        winningAccountId: 1,
        losingAccountId: 2,
      },
    });
    expect(status).toBe(500);
    expect(data).toStrictEqual({ message: errorMsg });
  });
});
