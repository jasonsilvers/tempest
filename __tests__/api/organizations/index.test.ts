import { mockMethodAndReturn } from '../../utils/mocks/repository';
import { findOrganizations } from '../../../src/repositories/organizationRepo';
import organizationApiHandler from '../../../src/pages/api/organizations/index';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { grants } from '../../utils/mocks/fixtures';
import { testNextApi } from '../../utils/NextAPIUtils';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/organizationRepo');
jest.mock('../../../src/repositories/grantsRepo');

const globalUserId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

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

beforeEach(() => {
  mockMethodAndReturn(findUserByDodId, {
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
  mockMethodAndReturn(findOrganizations, testOrganizations);
  const { status, data } = await testNextApi.get(organizationApiHandler);
  expect(status).toBe(200);
  expect(data).toStrictEqual({ organizations: testOrganizations });
});

test('should return 401 if not authorized', async () => {
  mockMethodAndReturn(findOrganizations, testOrganizations);
  const { status } = await testNextApi.get(organizationApiHandler, { withJwt: false });
  expect(status).toBe(401);
});
test('should return 403 if incorrect permission', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  mockMethodAndReturn(findOrganizations, testOrganizations);
  const { status } = await testNextApi.get(organizationApiHandler);
  expect(status).toBe(403);
});
