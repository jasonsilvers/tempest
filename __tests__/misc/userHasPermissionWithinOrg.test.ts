import { FindUserById, LoggedInUser } from '../../src/repositories/userRepo';
import { loggedInUserHasPermissionOnUser } from '../../src/utils/userHasPermissionWithinOrg';

import { mockMethodAndReturn } from '../testutils/mocks/repository';
import { getOrganizationAndDown } from '../../src/repositories/organizationRepo';

jest.mock('../../src/repositories/userRepo.ts');
jest.mock('../../src/repositories/organizationRepo.ts');

const organizationAndDown = [
  {
    id: 1,
    name: '15th Medical Group',
    shortName: '15th MDG',
    parentId: null,
    types: ['CATALOG'],
  },
  {
    id: 4,
    name: '15 Operation Medical Readiness Squadron',
    shortName: '15 OMRS',
    parentId: 1,
    types: [],
  },
  {
    id: 5,
    name: '15 Healthcare Operation Squadron',
    shortName: '15 HCOS',
    parentId: 1,
    types: [],
  },
  {
    id: 6,
    name: '15th Medical Group Executive Staff',
    shortName: '15th MDG Exc Staff',
    parentId: 1,
    types: [],
  },
  {
    id: 7,
    name: '15 Medical Support Squadron',
    shortName: '15 MDSS',
    parentId: 1,
    types: [],
  },
  {
    id: 8,
    name: 'Aerospace Medicine',
    shortName: 'Aerospace Medicine',
    parentId: 4,
    types: [],
  },
];

beforeEach(() => {
  mockMethodAndReturn(getOrganizationAndDown, organizationAndDown);
});

test('should return true if user has permission to access records for member in org', async () => {
  const monitor = {
    id: 123,
    organizationId: 1,
    reportingOrganizationId: 1,
  } as unknown as LoggedInUser;

  const member = {
    id: 321,
    organizationId: 1,
    reportingOrganizationId: 1,
  } as unknown as FindUserById;

  const result = await loggedInUserHasPermissionOnUser(monitor, member);

  expect(result).toBe(true);
});

test('should return false if user does not have permission to access records for member in org', async () => {
  const monitor = {
    id: 123,
    organizationId: 1,
    reportingOrganizationId: 1,
  } as unknown as LoggedInUser;

  const member = {
    id: 321,
    organizationId: 200,
    reportingOrganizationId: 200,
  } as unknown as FindUserById;

  const result = await loggedInUserHasPermissionOnUser(monitor, member);

  expect(result).toBe(false);
});

test('should always return true if user is reqesting permission on self', async () => {
  const monitor = {
    id: 123,
    organizationId: 1,
    reportingOrganizationId: 1,
  } as unknown as LoggedInUser;

  const member = {
    id: 123,
    organizationId: 1,
    reportingOrganizationId: 1,
  } as unknown as FindUserById;

  const result = await loggedInUserHasPermissionOnUser(monitor, member);

  expect(result).toBe(true);
});

test('should return true if user does have permission to access records for member in org', async () => {
  const monitor = {
    id: 123,
    organizationId: 1,
    reportingOrganizationId: 1,
  } as unknown as LoggedInUser;

  const member = {
    id: 321,
    organizationId: 1,
    reportingOrganizationId: 1,
  } as unknown as FindUserById;

  const result = await loggedInUserHasPermissionOnUser(monitor, member);

  expect(result).toBe(true);
});

test('should return true if user does have permission to access records for member in reporting org', async () => {
  const monitor = {
    id: 123,
    organizationId: 1,
    reportingOrganizationId: 1,
  } as unknown as LoggedInUser;

  const member = {
    id: 321,
    organizationId: 200,
    reportingOrganizationId: 1,
  } as unknown as FindUserById;

  const result = await loggedInUserHasPermissionOnUser(monitor, member);

  expect(result).toBe(true);
});
