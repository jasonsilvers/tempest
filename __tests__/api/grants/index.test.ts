import { testNextApi } from '../../utils/NextAPIUtils';
import grantsHandler from '../../../src/pages/api/grants';
import { mockMethodAndReturn } from '../../utils/mocks/repository';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { grants } from '../../utils/mocks/fixtures';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');

const globalUserId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

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

test('should return grants', async () => {
  const { status, data } = await testNextApi.get(grantsHandler);

  expect(status).toBe(200);
  expect(data).toStrictEqual({ grants });
});
test('should return 401 if not authorized', async () => {
  const { status } = await testNextApi.get(grantsHandler, { withJwt: false });

  expect(status).toBe(401);
});

test('should return 405 if method not allowed', async () => {
  const { status } = await testNextApi.post(grantsHandler, { withJwt: true, body: {} });

  expect(status).toBe(405);
});
