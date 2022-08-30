import { testNextApi } from '../../testutils/NextAPIUtils';
import rolesHandler from '../../../src/pages/api/roles';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { getRoles, createRole } from '../../../src/repositories/roleRepo';
import { adminJWT, userJWT } from '../../testutils/mocks/mockJwt';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { ERole } from '../../../src/const/enums';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/roleRepo.ts');

const globalUserId = 1;

const roles = Object.values(ERole);

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  mockMethodAndReturn(findGrants, grants);
  mockMethodAndReturn(getRoles, roles);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should return resources', async () => {
  const { status, data } = await testNextApi.get(rolesHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ roles });
});

test('should return 401 if not authorized', async () => {
  const { status } = await testNextApi.get(rolesHandler, { withJwt: false });

  expect(status).toBe(401);
});

test('should return 403 if permissions are incorrect -GET', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  const { status } = await testNextApi.get(rolesHandler);

  expect(status).toBe(403);
});

test('should return 405 if method is not allowed', async () => {
  const { status } = await testNextApi.put(rolesHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
    body: {},
  });

  expect(status).toBe(405);
});

test('should create role', async () => {
  mockMethodAndReturn(createRole, { name: 'dummyRole' });
  const { status, data } = await testNextApi.post(rolesHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
    body: { name: 'dummyRole' },
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ name: 'dummyRole' });
});

test('should not create if not admin', async () => {
  mockMethodAndReturn(createRole, { name: 'testResource3' });
  const { status } = await testNextApi.post(rolesHandler, {
    customHeaders: { Authorization: `Bearer ${userJWT}` },
    body: { name: 'testResource3' },
  });

  expect(status).toBe(403);
});
