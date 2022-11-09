import { findOrganizationById, OrganizationWithChildrenAndUsers } from '../../src/repositories/organizationRepo';
import { isOrgChildOf } from '../../src/utils/isOrgChildOf';

jest.mock('../../src/repositories/organizationRepo.ts');

const mockedFindOrganizationById = findOrganizationById as jest.MockedFunction<typeof findOrganizationById>;

afterEach(() => {
  jest.resetAllMocks();
});

test('should return true if parentId matches', async () => {
  const organization: OrganizationWithChildrenAndUsers = {
    id: 1,
    name: 'organization1',
    parentId: 2,
    children: null,
    users: null,
  };
  mockedFindOrganizationById.mockResolvedValueOnce(organization);

  const isChild = await isOrgChildOf(1, 2, mockedFindOrganizationById);

  expect(isChild).toBe(true);
});

test('should return false if no parentId', async () => {
  const organization: OrganizationWithChildrenAndUsers = {
    id: 1,
    name: 'organization1',
    parentId: null,
    children: null,
    users: null,
  };

  mockedFindOrganizationById.mockResolvedValueOnce(organization);

  const isChild = await isOrgChildOf(1, 2, mockedFindOrganizationById);

  expect(isChild).toBe(false);
});

test('should return true if orgId is found on parent of parent', async () => {
  const organization1: OrganizationWithChildrenAndUsers = {
    id: 1,
    name: 'organization1',
    parentId: null,
    children: null,
    users: null,
  };

  const organization2: OrganizationWithChildrenAndUsers = {
    id: 2,
    name: 'organization2',
    parentId: 1,
    children: null,
    users: null,
  };

  mockedFindOrganizationById.mockResolvedValueOnce(organization2).mockResolvedValueOnce(organization1);

  const isChild = await isOrgChildOf(2, 1, mockedFindOrganizationById);

  expect(isChild).toBe(true);
});

test('should return true if orgId is found on parent of parent of parent', async () => {
  const organization1: OrganizationWithChildrenAndUsers = {
    id: 1,
    name: 'organization1',
    parentId: null,
    children: null,
    users: null,
  };

  const organization2: OrganizationWithChildrenAndUsers = {
    id: 2,
    name: 'organization2',
    parentId: 1,
    children: null,
    users: null,
  };

  const organization3: OrganizationWithChildrenAndUsers = {
    id: 3,
    name: 'organization3',
    parentId: 2,
    children: null,
    users: null,
  };

  mockedFindOrganizationById
    .mockResolvedValueOnce(organization3)
    .mockResolvedValueOnce(organization2)
    .mockResolvedValueOnce(organization1);

  const isChild = await isOrgChildOf(3, 1, mockedFindOrganizationById);

  expect(mockedFindOrganizationById).toBeCalledTimes(2);
  expect(isChild).toBe(true);
});

// This case might should return an exception since it may falsely imply the child org has a parent
// and the data for the "child" org reflects this but in reality the parent id does not exist in DB
test('should return false if organization does not have parent', async () => {
  const organization: OrganizationWithChildrenAndUsers = {
    id: 2,
    name: 'organization2',
    parentId: 5,
    children: null,
    users: null,
  };

  mockedFindOrganizationById.mockResolvedValueOnce(organization).mockResolvedValueOnce(null);

  const isChild = await isOrgChildOf(2, 1, mockedFindOrganizationById);

  expect(isChild).toBe(false);
});
