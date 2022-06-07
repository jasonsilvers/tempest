import { mockMethodAndReturn } from '../testutils/mocks/repository';
import { findUserByEmail, updateLastLogin, updateUserRole } from '../../src/repositories/userRepo';
import { explodedJwt, explodedJwt_admin, grants } from '../testutils/mocks/fixtures';
import { server } from '../testutils/mocks/msw';
import { findGrants } from '../../src/repositories/grantsRepo';
import { returnUser } from '../../src/repositories/loginRepo';
import { createNewUserFromJWT } from '../../src/repositories/utils';

jest.mock('../../src/repositories/userRepo');
jest.mock('../../src/repositories/roleRepo');
jest.mock('../../src/repositories/grantsRepo.ts');
jest.mock('../../src/repositories/utils.ts');

const dodId = '2223332221';

const returnedUser = {
  id: 1,
  firstName: 'joe',
  role: { id: '22', name: 'monitor' },
};

// configure process.env variables before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
  process.env.ERROR_DEBUG = 'FALSE';
});

afterEach(() => {
  server.resetHandlers();
  jest.resetAllMocks();
});

beforeEach(() => {
  mockMethodAndReturn(updateLastLogin, returnedUser);
  mockMethodAndReturn(findGrants, grants);
});

// remove process.env variables after all tests
afterAll(() => {
  server.close();
  process.env.ERROR_DEBUG = 'TRUE';
});

test('login findOrAdduser should return user if found in tempest', async () => {
  const expectedUser = { ...returnedUser, dodId };
  mockMethodAndReturn(findUserByEmail, expectedUser);
  mockMethodAndReturn(createNewUserFromJWT, expectedUser);

  const user = await returnUser(dodId, explodedJwt);

  expect(user).toMatchObject(expectedUser);
});

test('login should make admin if user has correct claim in jwt', async () => {
  const expectedUserFromFinderUserByDodId = { ...returnedUser, dodId };
  const expectedUserFromUpdateUserRole = { ...expectedUserFromFinderUserByDodId, role: { id: 20, name: 'admin' } };
  mockMethodAndReturn(findUserByEmail, expectedUserFromFinderUserByDodId);
  mockMethodAndReturn(updateUserRole, expectedUserFromUpdateUserRole);

  const user = await returnUser(dodId, explodedJwt_admin);

  expect(user).toStrictEqual(expectedUserFromUpdateUserRole);
  expect(updateUserRole).toHaveBeenCalled();
});

test('login findOrAdduser should create user in tempest if not found', async () => {
  const expectedUser = { ...returnedUser, dodId };

  mockMethodAndReturn(findUserByEmail, null);
  mockMethodAndReturn(createNewUserFromJWT, expectedUser);

  const user = await returnUser(dodId, explodedJwt);

  expect(user).toMatchObject(expectedUser);
});
