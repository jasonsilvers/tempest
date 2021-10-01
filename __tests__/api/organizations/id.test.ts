import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import organizationsIdApiHandler from '../../../src/pages/api/organizations/[id]';
import { testNextApi } from '../../testutils/NextAPIUtils';
import { findOrganizationById, OrganizationWithChildren } from '../../../src/repositories/organizationRepo';
import { User } from '@prisma/client';
import { isOrgChildOf } from '../../../src/utils/isOrgChildOf';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/organizationRepo.ts');
jest.mock('../../../src/utils/isOrgChildOf.ts');

const organizationWithNoChildren: OrganizationWithChildren = {
  id: '2',
  name: '15th wing',
  parentId: '1',
  children: null,
  users: null,
};
const organizationWithChildren: OrganizationWithChildren = {
  id: '1',
  name: 'dental',
  parentId: null,
  children: [organizationWithNoChildren],
  users: [],
};

beforeEach(() => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
    organizationId: '2',
  });
  mockMethodAndReturn(findGrants, grants);
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
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
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
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: 'uiaewniwefnu',
  });

  const organization2: OrganizationWithChildren = {
    id: '4',
    name: 'dental',
    parentId: null,
    children: null,
    users: [],
  };
  const organization1: OrganizationWithChildren = {
    id: 'uiaewniwefnu',
    name: '15th wing',
    parentId: '1',
    children: [organization2],
    users: null,
  };

  mockMethodAndReturn(findOrganizationById, organization1);

  const { status } = await testNextApi.get(organizationsIdApiHandler, {
    urlId: '2',
  });

  expect(status).toBe(403);
});
test('should return organization and its members - read own', async () => {
  const testUser: Partial<User> = {
    id: '123',
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

  expect(findOrganizationById).toBeCalledWith('2', { withChildren: false, withUsers: true });
  expect(status).toBe(200);
  expect(data).toStrictEqual(organizationWithUsers);
});

test('should return organization and its children - read own', async () => {
  mockMethodAndReturn(findOrganizationById, organizationWithChildren);

  const { status, data } = await testNextApi.get(organizationsIdApiHandler, {
    urlId: '2?include=children',
  });

  expect(findOrganizationById).toBeCalledWith('2', { withChildren: true, withUsers: false });
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

test('should only allow get', async () => {
  mockMethodAndReturn(findOrganizationById, organizationWithChildren);
  const { status } = await testNextApi.post(organizationsIdApiHandler, { body: {} });

  expect(status).toBe(405);
});
