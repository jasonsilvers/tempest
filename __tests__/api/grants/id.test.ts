/*
 * @jest-environment node
 */

import { testNextApi } from '../../testutils/NextAPIUtils';
import grantsHandler from '../../../src/pages/api/grants/[id]';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { deleteGrant, updateGrant } from '../../../src/repositories/grantsRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { adminJWT } from '../../testutils/mocks/mockJwt';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');

const globalUserId = 1;

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should update grant', async () => {
  mockMethodAndReturn(updateGrant, grants[0]);

  const { status, data } = await testNextApi.put(grantsHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
    body: { firstName: 'bob', lastName: 'anderson' },
    urlId: '1',
  });

  expect(status).toBe(200);

  expect(data).toStrictEqual({ grant: grants[0] });
});

test('should delete grant', async () => {
  mockMethodAndReturn(deleteGrant, grants[0]);

  const { status, data } = await testNextApi.delete(grantsHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
    urlId: '1',
  });

  expect(status).toBe(200);

  expect(data).toStrictEqual({ message: 'ok' });
});

test('should return 403 if not admin', async () => {
  const { status } = await testNextApi.put(grantsHandler, { body: { firstName: 'bob', lastName: 'anderson' } });

  expect(status).toBe(403);
});

test('should return 405 if method not allowed', async () => {
  const { status } = await testNextApi.post(grantsHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
    body: {},
  });

  expect(status).toBe(405);
});
