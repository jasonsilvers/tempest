/*
 * @jest-environment node
 */

import { testNextApi } from '../../testutils/NextAPIUtils';
import grantsHandler from '../../../src/pages/api/grants';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { createGrant, findGrants } from '../../../src/repositories/grantsRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { adminJWT, userJWT } from '../../testutils/mocks/mockJwt';
import { findResources } from '../../../src/repositories/resourceRepo';
import { EResource } from '../../../src/const/enums';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/resourceRepo.ts');

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

test('should create grant', async () => {
  mockMethodAndReturn(createGrant, grants[0]);
  mockMethodAndReturn(findResources, [{ id: 1, name: EResource.MATTERMOST }]);
  const { status, data } = await testNextApi.post(grantsHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
    body: { ...grants[0] },
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ ...grants[0] });
});

test('should not create grant if not admin', async () => {
  mockMethodAndReturn(createGrant, grants[0]);
  const { status } = await testNextApi.post(grantsHandler, {
    customHeaders: { Authorization: `Bearer ${userJWT}` },
    body: { ...grants[0] },
  });

  expect(status).toBe(403);
});

test('should return 409 if creating grant and resource does not exist', async () => {
  mockMethodAndReturn(findResources, [{ id: 1, name: 'test' }]);
  const { status } = await testNextApi.post(grantsHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
    body: { ...grants[0] },
  });

  expect(status).toBe(409);
});

test('should return 401 if not authorized', async () => {
  const { status } = await testNextApi.get(grantsHandler, { withJwt: false });

  expect(status).toBe(401);
});

test('should return 405 if method not allowed', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  const { status } = await testNextApi.put(grantsHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
    body: {},
  });

  expect(status).toBe(405);
});
