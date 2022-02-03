import { testNextApi } from '../../testutils/NextAPIUtils';
import grantsHandler from '../../../src/pages/api/grants';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { grants } from '../../testutils/mocks/fixtures';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');

const globalUserId = 1;

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
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
