import { mockMethodAndReturn } from '../../utils/mocks/repository';
import { findUserByDodId, findUserById } from '../../../src/repositories/userRepo';
import userQueryHandler from '../../../src/pages/api/users/[id]';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { grants } from '../../utils/mocks/fixtures';
import testNextApi from '../../utils/NextAPIUtils';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/grantsRepo.ts');

const userFromDb = {
  id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
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

test('GET - should return user - read any', async () => {
  mockMethodAndReturn(findUserById, userFromDb);
  const { data, status } = await testNextApi.get(userQueryHandler, { urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2' });

  expect(status).toBe(200);
  expect(data).toStrictEqual(userFromDb);
});

test('GET - should return user - read own', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findUserById, userFromDb);
  const { data, status } = await testNextApi.get(userQueryHandler, { urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2' });

  expect(status).toBe(200);
  expect(data).toStrictEqual(userFromDb);
});

test('GET - should return 403 if incorrect permission', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  const { status } = await testNextApi.get(userQueryHandler);

  expect(status).toBe(403);
});

test('GET - should return 403 if member and does not own record', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  const { status } = await testNextApi.get(userQueryHandler, {
    urlId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  });

  expect(status).toBe(403);
});

test('GET - should return 401 if not authorized', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  const { status } = await testNextApi.get(userQueryHandler, {
    withJwt: false,
  });

  expect(status).toBe(401);
});

test('GET - should only allow get', async () => {
  const { status } = await testNextApi.put(userQueryHandler, { body: {} });

  expect(status).toBe(405);
});
