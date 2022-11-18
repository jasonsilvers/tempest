import mergeUserAccountApiHandler from '../../../src/pages/api/account/merge';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { deleteUser, findUserByEmail, findUserById, updateUser } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { adminJWT, memberJWT } from '../../testutils/mocks/mockJwt';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { testNextApi } from '../../testutils/NextAPIUtils';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/grantsRepo');

const globalUserId = 1;

const userFromDb = {
  id: globalUserId,
  firstName: 'joe',
  lastName: 'anderson',
  email: 'anderson@gmail.com',
};

const secondUserAccountFromDb = {
  id: 2,
  firstName: 'joe',
  lastName: 'anderson',
  email: 'anderson2@gmail.com',
};

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  mockMethodAndReturn(findGrants, grants);
});

const userWithUpdatedEmail = { ...userFromDb, email: secondUserAccountFromDb.email };
const userWithNullEmail = { ...userFromDb, email: null };

afterEach(() => {
  jest.resetAllMocks();
});

describe('Merge User Account', () => {
  test('Should merge account and delete the loser account', async () => {
    mockMethodAndReturn(findUserById, userFromDb);
    mockMethodAndReturn(findUserById, secondUserAccountFromDb);
    mockMethodAndReturn(updateUser, userWithUpdatedEmail);
    mockMethodAndReturn(deleteUser, secondUserAccountFromDb);

    const { status, data } = await testNextApi.post(mergeUserAccountApiHandler, {
      customHeaders: { Authorization: `Bearer ${adminJWT}` },
      body: {
        winningAccountId: userFromDb.id,
        losingAccountId: secondUserAccountFromDb.id,
      },
    });
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
        winningAccountId: userFromDb.id,
        losingAccountId: secondUserAccountFromDb.id,
      },
    });
    expect(status).toBe(403);
  });

  test('should return 500, when error occurs', async () => {
    mockMethodAndReturn(findUserById, userFromDb);
    mockMethodAndReturn(findUserByEmail, userWithNullEmail);
    const mockedUpdateUser = updateUser as jest.MockedFunction<typeof updateUser>;
    const errorMsg = 'There was a problem merging the accounts, please try again.';
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
