import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { createOrganizations, deleteOrganization } from '../../../src/repositories/organizationRepo';
import onboardOrgApiHandler from '../../../src/pages/api/tempest/onboard/org';
import { findUserByEmail, updateUser } from '../../../src/repositories/userRepo';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { testNextApi } from '../../testutils/NextAPIUtils';
import { OrganizationType, Organization } from '@prisma/client';
import { getRoleByName } from '../../../src/repositories/roleRepo';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/organizationRepo');
jest.mock('../../../src/repositories/grantsRepo');
jest.mock('../../../src/repositories/roleRepo');

const globalUserId = 1;

const userFromDb = {
  id: globalUserId,
  firstName: 'joe',
  lastName: 'anderson',
};

const newOrg = {
  name: 'New Org',
  shortName: 'Org',
} as Organization;

const createdOrg = {
  id: 47,
  name: 'New Org',
  shortName: 'Org',
  parentId: null,
  types: [OrganizationType.CATALOG],
} as Organization;

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  mockMethodAndReturn(findGrants, grants);
});

const programAdminRole = { id: 5, name: 'programadmin' };
const updatedUserFromDb = { ...userFromDb, roleId: 5, organizationalId: createdOrg.id };
const userWithNullId = { ...userFromDb, id: null };

afterEach(() => {
  jest.resetAllMocks();
});

describe('Onboard Org', () => {
  test('Should create new Org and change users Role to Program mananger of the new org', async () => {
    mockMethodAndReturn(getRoleByName, programAdminRole);
    mockMethodAndReturn(createOrganizations, createdOrg);
    mockMethodAndReturn(updateUser, updatedUserFromDb);
    const { status, data } = await testNextApi.post(onboardOrgApiHandler, {
      body: newOrg,
    });

    expect(status).toBe(200);
    expect(data).toStrictEqual(createdOrg);
  });
  test('Should return 405 for method not allowed', async () => {
    const { status } = await testNextApi.get(onboardOrgApiHandler);
    expect(status).toBe(405);
  });

  test('onboard fails during update user and should call deleteOrg', async () => {
    mockMethodAndReturn(getRoleByName, programAdminRole);
    mockMethodAndReturn(createOrganizations, createdOrg);
    mockMethodAndReturn(updateUser, userWithNullId);
    mockMethodAndReturn(deleteOrganization, createdOrg);

    const mockedUpdateUser = updateUser as jest.MockedFunction<typeof updateUser>;
    const errorMsg = { message: 'There was a problem onboarding your organization, please try again' };
    mockedUpdateUser.mockImplementation(() => {
      throw new Error('There was a problem onboarding your organization, please try again');
    });

    const { status, data } = await testNextApi.post(onboardOrgApiHandler, { body: newOrg });
    expect(status).toBe(500);
    expect(data).toStrictEqual(errorMsg);
  });
});
