/*
 * @jest-environment node
 */

import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { deleteUser, findUserByEmail, findUserById, updateUser } from '../../../src/repositories/userRepo';
import userQueryHandler from '../../../src/pages/api/users/[id]';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { testNextApi } from '../../testutils/NextAPIUtils';
import { User } from '@prisma/client';
import { getRoleById, getRoleByName } from '../../../src/repositories/roleRepo';
import { EAction, EResource, ERole } from '../../../src/const/enums';
import { userWithinOrgOrChildOrg } from '../../../src/utils/userWithinOrgorChildOrg';
import { loggedInUserHasPermissionOnUser } from '../../../src/utils/userHasPermissionWithinOrg';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/roleRepo');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/utils/userHasPermissionWithinOrg');
jest.mock('../../../src/repositories/memberTrackingRepo');

const userFromDb = {
  id: 2,
  firstName: 'joe',
  lastName: 'anderson',
  role: { id: '22', name: 'monitor' },
};

const loggedInUser = {
  id: 1,
  firstName: 'joe',
  role: { id: '22', name: 'monitor' },
};

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, loggedInUser);
  mockMethodAndReturn(findGrants, grants);
  mockMethodAndReturn(getRoleById, { id: '22', name: 'monitor' });
  mockMethodAndReturn(loggedInUserHasPermissionOnUser, true);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('GET - should return user - read any', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
    organizationId: '123',
  });
  const userFromDbRead = {
    id: 2,
    firstName: 'joe',
    lastName: 'anderson',
    role: { id: '22', name: 'monitor' },
    organizationId: '123',
  };
  mockMethodAndReturn(userWithinOrgOrChildOrg, true);

  mockMethodAndReturn(findUserById, userFromDbRead);
  const { data, status } = await testNextApi.get(userQueryHandler, { urlId: 2 });

  expect(status).toBe(200);
  expect(data).toStrictEqual(userFromDbRead);
});

test('GET - should return user - read own', async () => {
  const userReadOwnLoggedInUser = {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  };
  mockMethodAndReturn(findUserByEmail, userReadOwnLoggedInUser);
  mockMethodAndReturn(findUserById, userReadOwnLoggedInUser);

  const { data, status } = await testNextApi.get(userQueryHandler, { urlId: '1' });

  expect(status).toBe(200);
  expect(data).toStrictEqual(userReadOwnLoggedInUser);
});

test('GET - should return 403 - read any', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
    organizationId: '124',
  });

  const userFromDbReadAny = {
    id: 2,
    firstName: 'joe',
    lastName: 'anderson',
    role: { id: '22', name: 'monitor' },
    organizationId: '123',
  };

  mockMethodAndReturn(findUserById, userFromDbReadAny);
  mockMethodAndReturn(loggedInUserHasPermissionOnUser, false);

  const { status } = await testNextApi.get(userQueryHandler, { urlId: 2 });

  expect(status).toBe(403);
});

test('GET - should return 403 - read any', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: '124',
  });

  const userFromDbReadAny = {
    id: 2,
    firstName: 'joe',
    lastName: 'anderson',
    role: { id: '22', name: 'member' },
    organizationId: '123',
  };

  mockMethodAndReturn(findUserById, userFromDbReadAny);
  mockMethodAndReturn(userWithinOrgOrChildOrg, true);

  const { status } = await testNextApi.get(userQueryHandler, { urlId: 2 });

  expect(status).toBe(403);
});

test('GET - should return 403 - No role', async () => {
  mockMethodAndReturn(findUserById, userFromDb);
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  mockMethodAndReturn(userWithinOrgOrChildOrg, false);
  const { status } = await testNextApi.get(userQueryHandler, { urlId: 2 });

  expect(status).toBe(403);
});

test('GET - should return 403 - read own', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findUserById, { id: 1, firstName: 'Not Joe' });

  const { status } = await testNextApi.get(userQueryHandler, {
    urlId: 1,
  });

  expect(status).toBe(403);
});

test('GET - should return 403 - read own', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findUserById, { id: 1, firstName: 'Not Joe' });

  const { status } = await testNextApi.get(userQueryHandler, {
    urlId: 1,
  });

  expect(status).toBe(403);
});

test('GET - should return 401 if not authorized', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  const { status } = await testNextApi.get(userQueryHandler, {
    withJwt: false,
  });

  expect(status).toBe(401);
});

test('GET - should return 404 record not found', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findUserById, null);
  const { status } = await testNextApi.get(userQueryHandler, { urlId: '123' });

  expect(status).toBe(404);
});

test('GET - should return 405 if method not allowed', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findUserById, userFromDb);
  const { status } = await testNextApi.post(userQueryHandler, { body: {} });

  expect(status).toBe(405);
});

test('PUT - should return user - update own', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: 123,
  });
  mockMethodAndReturn(findUserById, { ...userFromDb, role: { id: '22', name: 'member' }, organizationId: 123 });
  mockMethodAndReturn(getRoleByName, { id: 2, name: 'member' });
  const spy = mockMethodAndReturn(updateUser, { name: 'bob', id: 123 });
  const { data, status } = await testNextApi.put(userQueryHandler, {
    urlId: 2,
    body: { organizationId: 123, dutyTitle: 'test Title', roleId: 1 } as User,
  });

  expect(spy).toHaveBeenCalledWith(2, {
    organizationId: 123,
    dutyTitle: 'test Title',
    roleId: 2,
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
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: 123,
  });
  mockMethodAndReturn(findUserById, { ...userFromDb, role: { id: '22', name: 'member' }, organizationId: 123 });
  mockMethodAndReturn(getRoleByName, { id: 2, name: 'member' });

  const spy = mockMethodAndReturn(updateUser, { name: 'bob', id: 123 });
  const { data, status } = await testNextApi.put(userQueryHandler, {
    urlId: 2,
    body: {
      organizationId: 123,
      email: 'email@email.com',
      roleId: 1,
      rank: 'rank',
      tags: ['tags'],
      afsc: 'afsc',
      dutyTitle: 'dutyTitle',
      address: 'address',
    },
  });

  expect(spy).toHaveBeenCalledWith(2, {
    organizationId: 123,
    tags: ['tags'],
    rank: 'rank',
    afsc: 'afsc',
    dutyTitle: 'dutyTitle',
    address: 'address',
    roleId: 2,
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ name: 'bob', id: 123 });
});

test('PUT - should set role to member when org changes', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '33', name: 'monitor' },
    organizationId: 123,
  });
  mockMethodAndReturn(getRoleById, { id: 2, name: 'member' });
  mockMethodAndReturn(getRoleByName, { id: 2, name: 'member' });
  mockMethodAndReturn(findUserById, { ...userFromDb, role: { id: '22', name: 'member' }, organizationId: 123 });
  const updateUserSpy = mockMethodAndReturn(updateUser, { name: 'bob', id: 123 });
  const { data, status } = await testNextApi.put(userQueryHandler, {
    urlId: 2,
    body: {
      organizationId: 987,
      email: 'email@email.com',
      roleId: 1,
      rank: 'rank',
      tags: ['tags'],
      afsc: 'afsc',
      dutyTitle: 'dutyTitle',
      address: 'address',
    },
  });
  expect(updateUserSpy).toHaveBeenCalledWith(2, {
    organizationId: 987,
    tags: ['tags'],
    rank: 'rank',
    afsc: 'afsc',
    dutyTitle: 'dutyTitle',
    address: 'address',
    roleId: 2,
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ name: 'bob', id: 123 });
});

test('PUT - should return user - update any', async () => {
  mockMethodAndReturn(findUserById, userFromDb);
  mockMethodAndReturn(getRoleByName, { id: 2, name: 'member' });

  mockMethodAndReturn(updateUser, { name: 'bob', id: 123 });
  mockMethodAndReturn(userWithinOrgOrChildOrg, true);

  const { data, status } = await testNextApi.put(userQueryHandler, {
    urlId: 2,
    body: { rank: 'bob' },
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ name: 'bob', id: 123 });
});

test('PUT - should return user if not in org and requesting user has adminrole - update any', async () => {
  mockMethodAndReturn(findUserByEmail, { ...userFromDb, id: 321, role: { id: 2, name: ERole.ADMIN } });
  mockMethodAndReturn(findUserById, userFromDb);
  mockMethodAndReturn(updateUser, { name: 'bob', id: 123 });
  mockMethodAndReturn(userWithinOrgOrChildOrg, false);
  const { data, status } = await testNextApi.put(userQueryHandler, {
    urlId: 2,
    body: { rank: 'bob' },
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ name: 'bob', id: 123 });
});

test('PUT - should return user if not in org and requesting user has adminrole - update any', async () => {
  mockMethodAndReturn(findUserByEmail, { ...userFromDb, id: 321, role: { id: 2, name: ERole.MEMBER } });
  mockMethodAndReturn(findUserById, userFromDb);
  mockMethodAndReturn(updateUser, { name: 'bob', id: 123 });
  mockMethodAndReturn(userWithinOrgOrChildOrg, true);
  const { status } = await testNextApi.put(userQueryHandler, {
    urlId: 2,
    body: { rank: 'bob' },
  });

  expect(status).toBe(403);
});

test('PUT - should return 400 if data is incorrect - update any', async () => {
  mockMethodAndReturn(findUserById, userFromDb);
  mockMethodAndReturn(updateUser, { name: 'bob', id: 123 });
  const { status } = await testNextApi.put(userQueryHandler, {
    urlId: 2,
    body: { name: 'bob', email: 30322, rank: 32343 },
  });

  expect(status).toBe(400);
});

test('PUT - should return 403 - update any', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findUserById, userFromDb);
  const { status } = await testNextApi.put(userQueryHandler, {
    urlId: 2,
    body: { rank: 'bob' },
  });

  expect(status).toBe(403);
});

test('DELETE - should return 404 if record not found', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });

  mockMethodAndReturn(findGrants, [
    ...grants,
    {
      action: EAction.DELETE_ANY,
      attributes: '*',
      resource: EResource.USER,
      role: ERole.ADMIN,
    },
  ]);

  mockMethodAndReturn(deleteUser, null);

  const { status } = await testNextApi.delete(userQueryHandler, {
    urlId: 1,
  });

  expect(status).toBe(404);
});
test('DELETE - should delete user and all records', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });

  mockMethodAndReturn(findGrants, [
    ...grants,
    {
      action: EAction.DELETE_ANY,
      attributes: '*',
      resource: EResource.USER,
      role: ERole.ADMIN,
    },
  ]);

  mockMethodAndReturn(findUserById, userFromDb);
  const mockedDeleteUser = mockMethodAndReturn(deleteUser, userFromDb);

  const { status } = await testNextApi.delete(userQueryHandler, {
    urlId: 1,
  });

  expect(mockedDeleteUser).toBeCalled();

  expect(status).toBe(200);
});
test('DELETE - should return 403 if permission not allowed', async () => {
  mockMethodAndReturn(findUserById, userFromDb);
  const mockedDeleteUser = mockMethodAndReturn(deleteUser, null);

  const { status } = await testNextApi.delete(userQueryHandler, {
    urlId: 1,
  });
  expect(mockedDeleteUser).not.toBeCalled();

  expect(status).toBe(403);
});
