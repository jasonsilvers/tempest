import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { findUserById, deleteUser } from '../../../src/repositories/userRepo';
import mergeUserAccountApiHandler from '../../../src/pages/api/account/merge';
import { findUserByEmail, updateUser } from '../../../src/repositories/userRepo';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { grants } from '../../testutils/mocks/fixtures';
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
const userWithNullId = { ...userFromDb, id: null };

afterEach(() => {
  jest.resetAllMocks();
});

describe('Merge User Account', () => {
  test.only('Should merge account and delete the loser account', async () => {
    mockMethodAndReturn(findUserByEmail, userFromDb);
    mockMethodAndReturn(findUserByEmail, secondUserAccountFromDb);
    mockMethodAndReturn(updateUser, userWithUpdatedEmail);
    mockMethodAndReturn(deleteUser, secondUserAccountFromDb);
    const { status, data } = await testNextApi.post(mergeUserAccountApiHandler, {
      body: {
        winningAccountEmail: userFromDb.email,
        losingAccountEmail: secondUserAccountFromDb.email,
      },
    });
    expect(status).toBe(200);
    expect(data).toStrictEqual({ message: 'ok' });
  });
  test('Should return 405 for method not allowed', async () => {
    const { status } = await testNextApi.get(mergeUserAccountApiHandler);
    expect(status).toBe(405);
  });

  test('merge fails and reverts the merge changes', async () => {
    mockMethodAndReturn(findUserById, userWithNullId);
    mockMethodAndReturn(findUserById, secondUserAccountFromDb);
    mockMethodAndReturn(updateUser, userFromDb);
    mockMethodAndReturn(updateUser, secondUserAccountFromDb);

    const mockedUpdateUser = updateUser as jest.MockedFunction<typeof updateUser>;
    const errorMsg = { message: 'There was a problem merging the accounts, please try again.' };
    mockedUpdateUser.mockImplementation(() => {
      throw new Error('There was a problem merging the accounts, please try again.');
    });

    const { status, data } = await testNextApi.post(mergeUserAccountApiHandler, {
      body: {
        winningAccountEmail: userFromDb.email,
        losingAccountEmail: null,
      },
    });
    expect(status).toBe(500);
    expect(data).toStrictEqual(errorMsg);
  });

  test('should not allow non-admin to merge', async () => {
    mockMethodAndReturn(findUserByEmail, {
      id: globalUserId,
      firstName: 'joe',
      role: { id: '22', name: 'monitor' },
    });
    const { status } = await testNextApi.post(mergeUserAccountApiHandler, {
      body: {
        winningAccountEmail: userFromDb.email ,
        losingAccountEmail: secondUserAccountFromDb.email,
      },
    });
    expect(status).toBe(403);
  });
});
