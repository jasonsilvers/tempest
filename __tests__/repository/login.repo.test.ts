import { mockMethodAndReturn } from '../utils/mocks/repository';
import {
  findUserByDodId,
  createUserFromCommonApi,
  updateLastLogin,
  updateUserRole,
} from '../../src/repositories/userRepo';
import { getRoleByName } from '../../src/repositories/roleRepo';
import { explodedJwt, explodedJwt_admin, grants } from '../utils/mocks/fixtures';
import { IPerson } from '../../src/repositories/common/types';
import { server } from '../utils/mocks/msw';
import { rest } from 'msw';
import { Role } from '.prisma/client';
import { findGrants } from '../../src/repositories/grantsRepo';
import { returnUser } from '../../src/repositories/loginRepo';

jest.mock('../../src/repositories/userRepo');
jest.mock('../../src/repositories/roleRepo');
jest.mock('../../src/repositories/grantsRepo.ts');

const dodId = '2223332221';

const returnedUser = {
  id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  firstName: 'joe',
  role: { id: '22', name: 'monitor' },
};

const peopleFromCommonApi: Partial<IPerson>[] = [
  {
    dodid: '23232342342',
    firstName: 'joe',
    lastName: 'anderson',
  },
  {
    dodid: dodId,
    firstName: 'Frank',
    lastName: 'Mileto',
  },
];

// configure process.env variables before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
  process.env.ERROR_DEBUG = 'FALSE';
  process.env.COMMON_API_URL = 'http://localhost:8089/api/v2';
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
  delete process.env.COMMON_API_URL;
});

test('login findOrAdduser should return user if found in tempest', async () => {
  const expectedUser = { ...returnedUser, dodId };
  mockMethodAndReturn(findUserByDodId, expectedUser);

  const user = await returnUser(dodId, explodedJwt);

  expect(user).toMatchObject(expectedUser);
});

test('login should make admin if user has correct claim in jwt', async () => {
  const expectedUserFromFinderUserByDodId = { ...returnedUser, dodId };
  const expectedUserFromUpdateUserRole = { ...expectedUserFromFinderUserByDodId, role: { id: 20, name: 'admin' } };
  mockMethodAndReturn(findUserByDodId, expectedUserFromFinderUserByDodId);
  mockMethodAndReturn(updateUserRole, expectedUserFromUpdateUserRole);

  const user = await returnUser(dodId, explodedJwt_admin);

  expect(user).toStrictEqual(expectedUserFromUpdateUserRole);
  expect(updateUserRole).toHaveBeenCalled();
});

test('login findOrAdduser should create user in tempest if found in commonAPI and return user', async () => {
  const expectedUser = { ...returnedUser, dodId };

  server.use(
    rest.post('http://localhost:8089/api/v2/person/*', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(peopleFromCommonApi[0]));
    })
  );

  mockMethodAndReturn(findUserByDodId, null);
  mockMethodAndReturn(createUserFromCommonApi, expectedUser);

  const user = await returnUser(dodId, explodedJwt);

  expect(user).toMatchObject(expectedUser);
});

test('login handle error from getPersonFromCommonApi', async () => {
  server.use(
    rest.post('http://localhost:8089/api/v2/person/find', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }));
    })
  );

  mockMethodAndReturn(findUserByDodId, null);
  mockMethodAndReturn(getRoleByName, { id: 1, name: 'Member' } as Role);

  const expectedError = new Error('There was an error making the request');

  try {
    await returnUser(dodId, explodedJwt);
  } catch (error) {
    expect(error).toEqual(expectedError);
  }
});
test('login findOrAdduser should handle error if cannot create commonapi person', async () => {
  server.use(
    rest.post('http://localhost:8089/api/v2/person/find', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(null));
    })
  );

  server.use(
    rest.post('http://localhost:8089/api/v2/person/person-jwt', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json(null));
    })
  );

  mockMethodAndReturn(findUserByDodId, null);
  mockMethodAndReturn(getRoleByName, { id: 1, name: 'Member' } as Role);

  const expectedError = new Error('There was an error making the request');

  try {
    await returnUser(dodId, explodedJwt);
  } catch (error) {
    expect(error).toEqual(expectedError);
  }
});
test('login should creater user in commonAPI and in Tempest if not found in either and return user', async () => {
  const expectedUser = { ...returnedUser, dodId };

  server.use(
    rest.post('http://localhost:8089/api/v2/person/find', (req, res, ctx) => {
      return res(ctx.status(404), ctx.json(null));
    })
  );

  server.use(
    rest.post('http://localhost:8089/api/v2/person/person-jwt', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(peopleFromCommonApi[1]));
    })
  );

  mockMethodAndReturn(findUserByDodId, null);
  mockMethodAndReturn(createUserFromCommonApi, expectedUser);

  const user = await returnUser(dodId, explodedJwt);
  expect(user).toMatchObject(expectedUser);
});
