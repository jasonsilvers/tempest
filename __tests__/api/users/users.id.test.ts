import { mockMethodAndReturn } from '../../utils/mocks/repository';
import { findUserByDodId, findUserById } from '../../../src/repositories/userRepo';
import userQueryHandler from '../../../src/pages/api/users/[id]';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { grants } from '../../utils/mocks/fixtures';
import { testNextApi } from '../../utils/NextAPIUtils';
import { isOrgChildOf } from '../../../src/utils/isOrgChildOf';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/utils/isOrgChildOf.ts');

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

test('GET - should return user - read', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
    organizationId: '123',
  });
  const userFromDbRead = {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    lastName: 'anderson',
    role: { id: '22', name: 'monitor' },
    organizationId: '123',
  };

  mockMethodAndReturn(findUserById, userFromDbRead);
  const { data, status } = await testNextApi.get(userQueryHandler, { urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2' });

  expect(status).toBe(200);
  expect(data).toStrictEqual(userFromDbRead);
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

test('GET - should return 403 - read any', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
    organizationId: '124',
  });

  const userFromDbReadAny = {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    lastName: 'anderson',
    role: { id: '22', name: 'monitor' },
    organizationId: '123',
  };

  mockMethodAndReturn(findUserById, userFromDbReadAny);
  mockMethodAndReturn(isOrgChildOf, false);

  const { status } = await testNextApi.get(userQueryHandler, { urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2' });

  expect(status).toBe(403);
});

test('GET - should return 403 - No role', async () => {
  mockMethodAndReturn(findUserById, userFromDb);
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  mockMethodAndReturn(isOrgChildOf, false);
  const { status } = await testNextApi.get(userQueryHandler, { urlId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2' });

  expect(status).toBe(403);
});

test('GET - should return 403 - read own', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findUserById, userFromDb);

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
  const { status } = await testNextApi.post(userQueryHandler, { body: {} });

  expect(status).toBe(405);
});
