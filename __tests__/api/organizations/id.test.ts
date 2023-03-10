/*
 * @jest-environment node
 */

import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import organizationsIdApiHandler from '../../../src/pages/api/organizations/[id]';
import { testNextApi } from '../../testutils/NextAPIUtils';
import {
  deleteOrganization,
  findOrganizationById,
  OrganizationWithChildrenAndUsers,
  updateOrganization,
} from '../../../src/repositories/organizationRepo';
import { User } from '@prisma/client';
import { isOrgChildOf } from '../../../src/utils/isOrgChildOf';
import { EAction, EResource, ERole } from '../../../src/const/enums';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/organizationRepo.ts');
jest.mock('../../../src/utils/isOrgChildOf.ts');

const organizationWithNoChildren: OrganizationWithChildrenAndUsers = {
  id: 2,
  name: '15th wing',
  shortName: '15wg',
  parentId: 1,
  children: [],
  users: [],
  types: [],
};
const organizationWithChildren: OrganizationWithChildrenAndUsers = {
  id: 1,
  name: 'dental',
  shortName: '15wg',
  parentId: null,
  children: [organizationWithNoChildren],
  users: [
    {
      id: 2,
      firstName: 'joe',
      organizationId: 2,
    } as User,
  ],
  types: [],
};

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
    organizationId: 2,
  });
  mockMethodAndReturn(findGrants, [
    ...grants,
    {
      action: EAction.UPDATE_ANY,
      attributes: '*',
      resource: EResource.ORGANIZATION,
      role: ERole.ADMIN,
    },
  ]);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should return 401 if not Authorized', async () => {
  const { status } = await testNextApi.get(organizationsIdApiHandler, {
    withJwt: false,
  });

  expect(status).toBe(401);
});

test('should allow user to get their organization - read own', async () => {
  mockMethodAndReturn(findOrganizationById, organizationWithNoChildren);

  const { status, data } = await testNextApi.get(organizationsIdApiHandler, {
    urlId: '2',
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual(organizationWithNoChildren);
});

test('should allow user to get child organization - read own', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
    organizationId: '1',
  });
  mockMethodAndReturn(findOrganizationById, organizationWithNoChildren);
  mockMethodAndReturn(isOrgChildOf, true);

  const { status, data } = await testNextApi.get(organizationsIdApiHandler, {
    urlId: '2',
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual(organizationWithNoChildren);
});

test('shoud allow user to get their organization and its children - read own', async () => {
  mockMethodAndReturn(findOrganizationById, organizationWithChildren);

  const { status, data } = await testNextApi.get(organizationsIdApiHandler, {
    urlId: '2',
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual(organizationWithChildren);
});
test('should not allow user to get any organization - read any', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: 'uiaewniwefnu',
  });

  const organization2: OrganizationWithChildrenAndUsers = {
    id: 4,
    name: 'dental',
    shortName: 'dental',
    parentId: null,
    children: [],
    users: [],
    types: [],
  };
  const organization1: OrganizationWithChildrenAndUsers = {
    id: 2,
    name: '15th wing',
    shortName: '15th wg',
    parentId: 1,
    children: [organization2],
    users: [],
    types: [],
  };

  mockMethodAndReturn(findOrganizationById, organization1);

  const { status } = await testNextApi.get(organizationsIdApiHandler, {
    urlId: '2',
  });

  expect(status).toBe(403);
});
test('should return organization and its members - read own', async () => {
  const testUser: Partial<User> = {
    id: 123,
    firstName: 'bob',
    lastName: 'jones',
  };
  const organizationWithUsers = {
    ...organizationWithNoChildren,
    users: [testUser],
  };
  mockMethodAndReturn(findOrganizationById, organizationWithUsers);

  const { status, data } = await testNextApi.get(organizationsIdApiHandler, {
    urlId: '2?include=users',
  });

  expect(findOrganizationById).toBeCalledWith(2, { withChildren: false, withUsers: true });
  expect(status).toBe(200);
  expect(data).toStrictEqual(organizationWithUsers);
});

test('should return organization and its children - read own', async () => {
  mockMethodAndReturn(findOrganizationById, organizationWithChildren);

  const { status, data } = await testNextApi.get(organizationsIdApiHandler, {
    urlId: '2?include=children',
  });

  expect(findOrganizationById).toBeCalledWith(2, { withChildren: true, withUsers: false });
  expect(status).toBe(200);
  expect(data).toStrictEqual(organizationWithChildren);
});

test('should return 404 if record not found', async () => {
  mockMethodAndReturn(findOrganizationById, null);

  const { status } = await testNextApi.get(organizationsIdApiHandler, {
    urlId: '2?include=children',
  });

  expect(status).toBe(404);
});

test('should return 403 if not allowed to update organization', async () => {
  mockMethodAndReturn(updateOrganization, organizationWithNoChildren);

  const { status } = await testNextApi.put(organizationsIdApiHandler, {
    urlId: '2',
    body: { id: 2, shortName: 'testUpdate' },
  });

  expect(status).toBe(403);
});

test('should update organization', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
    organizationId: 2,
  });
  mockMethodAndReturn(updateOrganization, organizationWithNoChildren);

  const { status, data } = await testNextApi.put(organizationsIdApiHandler, {
    urlId: 2,
    body: { id: 2, shortName: 'testUpdate' },
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual(organizationWithNoChildren);
});

test('should return 403 if not allowed to delete organization', async () => {
  mockMethodAndReturn(deleteOrganization, organizationWithNoChildren);

  const { status } = await testNextApi.delete(organizationsIdApiHandler, {
    urlId: '2',
  });

  expect(status).toBe(403);
});

test('should delete organization', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
    organizationId: 2,
  });
  mockMethodAndReturn(findOrganizationById, organizationWithNoChildren);
  mockMethodAndReturn(deleteOrganization, organizationWithNoChildren);

  const { status, data } = await testNextApi.delete(organizationsIdApiHandler, {
    urlId: 2,
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ message: 'ok' });
});

test('delete organization - should return not found', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
    organizationId: 2,
  });
  mockMethodAndReturn(findOrganizationById, null);
  mockMethodAndReturn(deleteOrganization, organizationWithNoChildren);

  const { status } = await testNextApi.delete(organizationsIdApiHandler, {
    urlId: 2,
  });

  expect(status).toBe(404);
});

test('delete organization - should return unable to delete of there are children', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
    organizationId: 2,
  });
  mockMethodAndReturn(findOrganizationById, organizationWithChildren);

  const { status } = await testNextApi.delete(organizationsIdApiHandler, {
    urlId: 2,
  });

  expect(status).toBe(409);
});

test('delete organization - should return unable to delete of there are users', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
    organizationId: 2,
  });
  mockMethodAndReturn(findOrganizationById, { ...organizationWithChildren, children: null });

  const { status } = await testNextApi.delete(organizationsIdApiHandler, {
    urlId: 2,
  });

  expect(status).toBe(409);
});

test('should not allow post', async () => {
  mockMethodAndReturn(findOrganizationById, organizationWithChildren);
  const { status } = await testNextApi.post(organizationsIdApiHandler, { body: {} });

  expect(status).toBe(405);
});
