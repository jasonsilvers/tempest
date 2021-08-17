import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { grants } from '../../utils/mocks/fixtures';
import { mockMethodAndReturn } from '../../utils/mocks/repository';
import roleHandler from '../../../src/pages/api/roles';
import { testNextApi } from '../../utils/NextAPIUtils';
import { getRoles } from '../../../src/repositories/roleRepo';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/roleRepo.ts');

const roles = [{ id: '22', name: 'monitor' }];

beforeEach(() => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
    organizationId: '2',
  });
  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should return roles', async () => {
  mockMethodAndReturn(getRoles, roles);
  const { status, data } = await testNextApi.get(roleHandler);

  expect(status).toBe(200);
  expect(data).toStrictEqual({ roles });
});
test('should return 401 if not authorized', async () => {
  const { status } = await testNextApi.get(roleHandler, { withJwt: false });

  expect(status).toBe(401);
});
test('should return 403 if incorrect permission - GET', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: '2',
  });
  const { status } = await testNextApi.get(roleHandler);

  expect(status).toBe(403);
});
test('should return 405 if method not allowed', async () => {
  const { status } = await testNextApi.post(roleHandler, { body: {} });

  expect(status).toBe(405);
});
