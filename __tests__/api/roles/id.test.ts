import { ERole } from '../../../src/const/enums';
import rolesApiHandler from '../../../src/pages/api/roles/[id]';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { userJWT } from '../../testutils/mocks/mockJwt';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { testNextApi } from '../../testutils/NextAPIUtils';
import { adminJWT } from '../../../cypress/fixtures/jwt';
import { deleteRole } from '../../../src/repositories/roleRepo';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/roleRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');

const globalUserId = 1;

const roles = Object.values(ERole);

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should not return 403 if not an admin', async () => {
  const { status } = await testNextApi.get(rolesApiHandler, {
    customHeaders: { Authorization: `Bearer ${userJWT}` },
  });

  expect(status).toBe(403);
});

test('should return 405 if method is not allowed', async () => {
  const { status } = await testNextApi.post(rolesApiHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
    body: {},
  });

  expect(status).toBe(405);
});

test('should delete a role', async () => {
  mockMethodAndReturn(deleteRole, roles[0]);
  const { status, data } = await testNextApi.delete(rolesApiHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
    urlId: '1',
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ message: 'ok' });
});
