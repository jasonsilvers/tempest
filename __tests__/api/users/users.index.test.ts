/*
 * @jest-environment node
 */

import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByEmail, findUsers, getAllUsersFromUsersOrgCascade } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { testNextApi } from '../../testutils/NextAPIUtils';
import userHandler from '../../../src/pages/api/users/index';
import { ERole } from '../../../src/const/enums';
import { getOrganizationTree } from '../../../src/repositories/organizationRepo';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/organizationRepo.ts');

const userFromDb = {
  id: 1,
  firstName: 'joe',
  lastName: 'anderson',
  role: { id: '22', name: 'monitor' },
};

const testOrganizations = [
  {
    id: '1',
    name: 'testOrg1',
  },
];

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should return 401 if not authorized', async () => {
  const { status } = await testNextApi.get(userHandler, { withJwt: false });
  expect(status).toEqual(401);
});
test('should return users', async () => {
  mockMethodAndReturn(getOrganizationTree, testOrganizations);
  mockMethodAndReturn(getAllUsersFromUsersOrgCascade, [userFromDb]);
  const { status, data } = await testNextApi.get(userHandler);
  expect(status).toEqual(200);

  expect(data).toStrictEqual({ users: [userFromDb] });
});

test('should not allow post', async () => {
  mockMethodAndReturn(findUsers, [userFromDb]);
  const { status } = await testNextApi.post(userHandler, { body: {} });
  expect(status).toEqual(405);
});

test('should return permission denied with bad grants', async () => {
  /*eslint-disable */
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  mockMethodAndReturn(findUsers, [userFromDb]);
  mockMethodAndReturn(findGrants, null);
  const { status } = await testNextApi.get(userHandler);
  expect(status).toEqual(500);
  if (process.env.NODE_ENV === 'production') {
    expect(consoleSpy).toHaveBeenCalled();
  }
});
test('should return permission denied with bad grants', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: ERole.NOROLE },
  });
  const { status } = await testNextApi.get(userHandler);
  expect(status).toEqual(403);
});
