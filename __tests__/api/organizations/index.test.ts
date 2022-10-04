/*
 * @jest-environment node
 */

import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import {
  findOrganizations,
  createOrganizations,
  getOrganizationAndDown,
} from '../../../src/repositories/organizationRepo';
import organizationApiHandler from '../../../src/pages/api/organizations/index';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { testNextApi } from '../../testutils/NextAPIUtils';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/organizationRepo');
jest.mock('../../../src/repositories/grantsRepo');

const globalUserId = 1;

const testOrganizations = [
  {
    id: '1',
    name: 'testOrg1',
  },
  {
    id: '2',
    name: 'testOrg2',
  },
];

const newOrgId = '67c6657f-0022-48b0-89b3-866dd89831ef';

const newOrg = {
  name: 'Vaccinations Squadron',
  shortName: 'vacc squad',
  parentId: null,
};

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should return organizations', async () => {
  mockMethodAndReturn(getOrganizationAndDown, testOrganizations);
  const { status, data } = await testNextApi.get(organizationApiHandler);
  expect(status).toBe(200);
  expect(data).toStrictEqual({ organizations: testOrganizations });
});

test('should return 401 if not authorized', async () => {
  mockMethodAndReturn(findOrganizations, testOrganizations);
  const { status } = await testNextApi.get(organizationApiHandler, { withJwt: false });
  expect(status).toBe(401);
});

test('should return method not allowed', async () => {
  const { status } = await testNextApi.put(organizationApiHandler, { body: {} });

  expect(status).toBe(405);
});

test('should create organization', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  mockMethodAndReturn(createOrganizations, { ...newOrg, id: newOrgId });
  const { status, data } = await testNextApi.post(organizationApiHandler, { body: newOrg });

  expect(status).toBe(200);

  expect(data).toStrictEqual({ ...newOrg, id: newOrgId });
});
test('should return 400 if id is not null', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  const { status } = await testNextApi.post(organizationApiHandler, { body: { ...newOrg, id: newOrgId } });

  expect(status).toBe(400);
});
test('should return 403 if incorrect permission - POST', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  const { status } = await testNextApi.post(organizationApiHandler, { body: newOrg });

  expect(status).toBe(403);
});
