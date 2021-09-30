import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId, getUsersWithMemberTrackingRecords, findUsers } from '../../../src/repositories/userRepo';
import { grants } from '../../utils/mocks/fixtures';
import { mockMethodAndReturn } from '../../utils/mocks/repository';
import { testNextApi } from '../../utils/NextAPIUtils';
import userHandler from '../../../src/pages/api/users/index';
import { ERole } from '../../../src/const/enums';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/grantsRepo.ts');

const userFromDb = {
  id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  firstName: 'joe',
  lastName: 'anderson',
  role: { id: '22', name: 'monitor' },
};

beforeEach(() => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
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
  mockMethodAndReturn(getUsersWithMemberTrackingRecords, [userFromDb]);
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
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: ERole.NOROLE },
  });
  const { status } = await testNextApi.get(userHandler);
  expect(status).toEqual(403);
});
