import { createMocks } from 'node-mocks-http';
import mockMethod from '../utils/mocks/repository';
import { returnUser, loginHandler } from '../../src/pages/api/login';
import {
  findUserByDodId,
  createUserFromCommonApi,
} from '../../src/repositories/userRepo';
import { getRoleByName } from '../../src/repositories/roleRepo';
import { explodedJwt } from '../utils/mocks/fixtures';
import { IPerson } from '../../src/repositories/common/types';
import { server } from '../utils/mocks/msw';
import { rest } from 'msw';
import { Role, User } from '.prisma/client';
import { loadEnvConfig } from '@next/env';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';

jest.mock('../../src/repositories/userRepo');
jest.mock('../../src/repositories/roleRepo');

const dodId = '2223332221';

const userTest = {
  id: '1',
  name: 'Bob',
};

const persons: Partial<IPerson>[] = [
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

beforeAll(() => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);
});

test('login handler returns user when user is found', async () => {
  const { req, res } = createMocks({
    method: 'GET',
  });

  req.user = userTest;

  await loginHandler(
    (req as unknown) as NextApiRequestWithAuthorization<User>,
    (res as unknown) as NextApiResponse
  );

  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData())).toEqual(userTest);
});

test('login findOrAdduser should return user if found in tempest', async () => {
  const expectedUser = { ...userTest, dodId };
  mockMethod(findUserByDodId, expectedUser);

  const user = await returnUser(dodId, explodedJwt);

  expect(user).toMatchObject(expectedUser);
});

test('login findOrAdduser should create user in tempest if found in commonAPI and return user', async () => {
  const expectedUser = { ...userTest, dodId };

  server.use(
    rest.get('http://localhost:8089/api/v1/person', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(persons));
    })
  );

  mockMethod(findUserByDodId, null);
  mockMethod(createUserFromCommonApi, expectedUser);

  const user = await returnUser(dodId, explodedJwt);

  expect(user).toMatchObject(expectedUser);
});
test('login findOrAdduser should creater user in commonAPI and in Tempest if not found in either and return user', async () => {
  const expectedUser = { ...userTest, dodId };

  server.use(
    rest.get('http://localhost:8089/api/v1/person', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(persons));
    })
  );

  server.use(
    rest.post('http://localhost:8089/api/v1/person', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json(persons[1]));
    })
  );

  mockMethod(findUserByDodId, null);
  mockMethod(createUserFromCommonApi, expectedUser);

  const user = await returnUser(dodId, explodedJwt);
  expect(user).toMatchObject(expectedUser);
});
test('login findOrAdduser handle error from getPerson', async () => {
  server.use(
    rest.get('http://localhost:8089/api/v1/person', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json(null));
    })
  );

  mockMethod(findUserByDodId, null);
  mockMethod(getRoleByName, { id: 1, name: 'Member' } as Role);
  mockMethod(createUserFromCommonApi, persons[1]);

  const expectedError = new Error('There was an error making the request');

  try {
    await returnUser(dodId, explodedJwt);
  } catch (error) {
    expect(error).toEqual(expectedError);
  }
});
test('login findOrAdduser should handle error if cannot create commonapi person', async () => {
  server.use(
    rest.get('http://localhost:8089/api/v1/person', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(null));
    })
  );

  server.use(
    rest.post('http://localhost:8089/api/v1/person', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json(null));
    })
  );

  mockMethod(findUserByDodId, null);
  mockMethod(getRoleByName, { id: 1, name: 'Member' } as Role);

  const expectedError = new Error('There was an error making the request');

  try {
    await returnUser(dodId, explodedJwt);
  } catch (error) {
    expect(error).toEqual(expectedError);
  }
});
test('login findOrAdduser should handle error if cannot create user in tempest', async () => {
  server.use(
    rest.get('http://localhost:8089/api/v1/person', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(null));
    })
  );

  server.use(
    rest.post('http://localhost:8089/api/v1/person', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(persons[1]));
    })
  );

  mockMethod(findUserByDodId, null);
  mockMethod(getRoleByName, { id: 1, name: 'Member' } as Role);
  const createUserMock = mockMethod(createUserFromCommonApi, null);

  const expectedError = new Error(
    'There was an error making the createUser call'
  );
  createUserMock.mockImplementationOnce(() => {
    throw expectedError;
  });

  try {
    await returnUser(dodId, explodedJwt);
  } catch (error) {
    expect(error).toEqual(expectedError);
  }
});
