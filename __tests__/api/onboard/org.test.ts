import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { createOrganizations } from '../../../src/repositories/organizationRepo';
import onboardOrgApiHandler from '../../../src/pages/api/onboard/org';
import { findUserByEmail, updateUser } from '../../../src/repositories/userRepo';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { testNextApi } from '../../testutils/NextAPIUtils';
import { OrganizationType } from '@prisma/client';
import { getRoleByName } from '../../../src/repositories/roleRepo';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/organizationRepo');
jest.mock('../../../src/repositories/grantsRepo');

const globalUserId = 1;

const newOrg = {
  name: 'New Org',
  shortName: 'Org',
};

const createdOrg = {
  id: 1,
  name: 'New Org',
  shortName: 'Org',
  parentId: null,
  types: [OrganizationType.CATALOG],
};

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);
});

const programAdminRole = { id: 5, name: 'programadmin' };
const updatedUser = { id: globalUserId, organizationId: createdOrg.id, roleId: programAdminRole.id };

afterEach(() => {
  jest.resetAllMocks();
});

describe('Onboard Org', () => {
  test.only('Should create new Org and change users Role to Program mananger of the new org', async () => {
    mockMethodAndReturn(getRoleByName, programAdminRole);
    mockMethodAndReturn(createOrganizations, createdOrg);
    mockMethodAndReturn(updateUser, updatedUser);
    const { status, data } = await testNextApi.post(onboardOrgApiHandler, {
      body: newOrg,
    });
    console.log(status, data);
    console.log(updatedUser);
    expect(status).toBe(200);
    expect(data).toStrictEqual(createdOrg);
  });
  test('Should return 405 for method not allowed', async () => {
    const { status } = await testNextApi.get(onboardOrgApiHandler);
    expect(status).toBe(405);
  });
});
