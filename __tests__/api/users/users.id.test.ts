import { mockMethodAndReturn } from '../../utils/mocks/repository';
import { findUserByDodId, findUserById, updateUser } from '../../../src/repositories/userRepo';
import userQueryHandler from '../../../src/pages/api/users/[id]';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { grants } from '../../utils/mocks/fixtures';
import { testNextApi } from '../../utils/NextAPIUtils';
import { isOrgChildOf } from '../../../src/utils/isOrgChildOf';
import { User } from '@prisma/client';
import { getRoleByName } from '../../../src/repositories/roleRepo';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/roleRepo');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/utils/isOrgChildOf.ts');

const userFromDb = {
  id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
  firstName: 'joe',
  lastName: 'anderson',
  role: { id: '22', name: 'monitor' },
};

beforeEach(() => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });

  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('GET - should return user - read any', async () => {
  mockMethodAndReturn(findUserById, userFromDb);
  const { data, status } = await testNextApi.get(userQueryHandler, { urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2' });

  expect(status).toBe(200);
  expect(data).toStrictEqual(userFromDb);
});

test('GET - should return user - read any', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
    organizationId: '123',
  });
  const userFromDbRead = {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    lastName: 'anderson',
    role: { id: '22', name: 'monitor' },
    organizationId: '123',
  };

  mockMethodAndReturn(findUserById, userFromDbRead);
  const { data, status } = await testNextApi.get(userQueryHandler, { urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2' });

  expect(status).toBe(200);
  expect(data).toStrictEqual(userFromDbRead);
});

test('GET - should return user - read own', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findUserById, userFromDb);
  const { data, status } = await testNextApi.get(userQueryHandler, { urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2' });

  expect(status).toBe(200);
  expect(data).toStrictEqual(userFromDb);
});

test('GET - should return 403 - read any', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
    organizationId: '124',
  });

  const userFromDbReadAny = {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    lastName: 'anderson',
    role: { id: '22', name: 'monitor' },
    organizationId: '123',
  };

  mockMethodAndReturn(findUserById, userFromDbReadAny);
  mockMethodAndReturn(isOrgChildOf, false);

  const { status } = await testNextApi.get(userQueryHandler, { urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2' });

  expect(status).toBe(403);
});

test('GET - should return 403 - No role', async () => {
  mockMethodAndReturn(findUserById, userFromDb);
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  mockMethodAndReturn(isOrgChildOf, false);
  const { status } = await testNextApi.get(userQueryHandler, { urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2' });

  expect(status).toBe(403);
});

test('GET - should return 403 - read own', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findUserById, { id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2', firstName: 'Not Joe' });

  const { status } = await testNextApi.get(userQueryHandler, {
    urlId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  });

  expect(status).toBe(403);
});

test('GET - should return 401 if not authorized', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  const { status } = await testNextApi.get(userQueryHandler, {
    withJwt: false,
  });

  expect(status).toBe(401);
});

test('GET - should return 404 record not found', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findUserById, null);
  const { status } = await testNextApi.get(userQueryHandler, { urlId: '123' });

  expect(status).toBe(404);
});

test('GET - should only allow get', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findUserById, userFromDb);
  const { status } = await testNextApi.post(userQueryHandler, { body: {} });

  expect(status).toBe(405);
});

test('PUT - should return user - update own', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: 'abc123',
  });
  mockMethodAndReturn(findUserById, { ...userFromDb, role: { id: '22', name: 'member' }, organizationId: 'abc123' });
  const spy = mockMethodAndReturn(updateUser, { name: 'bob', id: 123 });
  const { data, status } = await testNextApi.put(userQueryHandler, {
    urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    body: { organizationId: 'abc123', dutyTitle: 'test Title', roleId: 1 } as User,
  });

  expect(spy).toHaveBeenCalledWith('b100e2fa-50d0-49a6-b10f-00adde24d0c2', {
    organizationId: 'abc123',
    dutyTitle: 'test Title',
  } as User);

  expect(status).toBe(200);
  expect(data).toStrictEqual({ name: 'bob', id: 123 });
});

/**
 * 
 *    id: Joi.string().optional().allow(null, ''),
      email: Joi.string().email().optional().allow(null, ''),
      roleId: Joi.number().optional().allow(null, ''),
      organizationId: Joi.string().optional().allow(null, ''),
      tags: Joi.array().items(Joi.string()).optional().allow(null, ''),
      rank: Joi.string().optional().allow(null, ''),
      afsc: Joi.string().optional().allow(null, ''),
      dutyTitle: Joi.string().optional().allow(null, ''),
      address: Joi.string().optional().allow(null, ''),
 * 
 */
test('PUT - should filter data for member', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: 'abc123',
  });
  mockMethodAndReturn(findUserById, { ...userFromDb, role: { id: '22', name: 'member' }, organizationId: 'abc123' });
  const spy = mockMethodAndReturn(updateUser, { name: 'bob', id: 123 });
  const { data, status } = await testNextApi.put(userQueryHandler, {
    urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    body: {
      organizationId: 'abc123',
      email: 'email@email.com',
      roleId: 1,
      rank: 'rank',
      tags: ['tags'],
      afsc: 'afsc',
      dutyTitle: 'dutyTitle',
      address: 'address',
    },
  });

  expect(spy).toHaveBeenCalledWith('b100e2fa-50d0-49a6-b10f-00adde24d0c2', {
    organizationId: 'abc123',
    tags: ['tags'],
    rank: 'rank',
    afsc: 'afsc',
    dutyTitle: 'dutyTitle',
    address: 'address',
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ name: 'bob', id: 123 });
});

test('PUT - should set role to member when org changes', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: 'abc123',
  });
  mockMethodAndReturn(getRoleByName, { roleId: 2, name: 'member' });
  mockMethodAndReturn(findUserById, { ...userFromDb, role: { id: '22', name: 'member' }, organizationId: 'abc123' });
  const spy = mockMethodAndReturn(updateUser, { name: 'bob', id: 123 });
  const { data, status } = await testNextApi.put(userQueryHandler, {
    urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    body: {
      organizationId: 'zyx987',
      email: 'email@email.com',
      roleId: 1,
      rank: 'rank',
      tags: ['tags'],
      afsc: 'afsc',
      dutyTitle: 'dutyTitle',
      address: 'address',
    },
  });

  expect(spy).toHaveBeenCalledWith('b100e2fa-50d0-49a6-b10f-00adde24d0c2', {
    organizationId: 'zyx987',
    tags: ['tags'],
    rank: 'rank',
    afsc: 'afsc',
    dutyTitle: 'dutyTitle',
    address: 'address',
    role: {
      roleId: 2,
      name: 'member',
    },
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ name: 'bob', id: 123 });
});

test('PUT - should return user - update any', async () => {
  mockMethodAndReturn(findUserById, userFromDb);
  mockMethodAndReturn(updateUser, { name: 'bob', id: 123 });
  const { data, status } = await testNextApi.put(userQueryHandler, {
    urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    body: { rank: 'bob' },
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ name: 'bob', id: 123 });
});

test('PUT - should return 400 if data is incorrect - update any', async () => {
  mockMethodAndReturn(findUserById, userFromDb);
  mockMethodAndReturn(updateUser, { name: 'bob', id: 123 });
  const { status } = await testNextApi.put(userQueryHandler, {
    urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    body: { name: 'bob', email: 30322, rank: 32343 },
  });

  expect(status).toBe(400);
});

test('PUT - should return 403 - update any', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findUserById, userFromDb);
  const { status } = await testNextApi.put(userQueryHandler, {
    urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    body: { rank: 'bob' },
  });

  expect(status).toBe(403);
});
