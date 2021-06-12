import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId, findUsers } from '../../../src/repositories/userRepo';
import { grants } from '../../utils/mocks/fixtures';
import { mockMethodAndReturn } from '../../utils/mocks/repository';
import { testNextApi } from '../../utils/NextAPIUtils';
import userHandler from '../../../src/pages/api/users/index';

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
  mockMethodAndReturn(findUsers, [userFromDb]);
  const { status, data } = await testNextApi.get(userHandler);
  expect(status).toEqual(200);
  expect(data).toStrictEqual([userFromDb]);
});

test('should not allow post', async () => {
  mockMethodAndReturn(findUsers, [userFromDb]);
  const { status } = await testNextApi.post(userHandler, { body: {} });
  expect(status).toEqual(405);
});
