/*
 * @jest-environment node
 */

import { testNextApi } from '../../testutils/NextAPIUtils';
import resourceHandler from '../../../src/pages/api/resource';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { createResource, findResources } from '../../../src/repositories/resourceRepo';
import { adminJWT, userJWT } from '../../testutils/mocks/mockJwt';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/resourceRepo.ts');

const globalUserId = 1;

const resource = [
  { id: 1, name: 'testReource1' },
  { id: 2, name: 'testResource2' },
];

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  mockMethodAndReturn(findResources, resource);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should return resources', async () => {
  const { status, data } = await testNextApi.get(resourceHandler);

  expect(status).toBe(200);
  expect(data).toStrictEqual({ resource });
});

test('should return 401 if not authorized', async () => {
  const { status } = await testNextApi.get(resourceHandler, { withJwt: false });

  expect(status).toBe(401);
});

test('should return 403 if permissions are incorrect - GET', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  const { status } = await testNextApi.get(resourceHandler);

  expect(status).toBe(403);
});

test('should return 405 if method is not allow', async () => {
  const { status } = await testNextApi.put(resourceHandler, { withJwt: true, body: {} });

  expect(status).toBe(405);
});

test('should create resource', async () => {
  mockMethodAndReturn(createResource, { name: 'testResource3' });
  const { status, data } = await testNextApi.post(resourceHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
    body: { name: 'testResource3' },
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ name: 'testResource3' });
});

test('should not create if not admin', async () => {
  mockMethodAndReturn(createResource, { name: 'testResource3' });
  const { status } = await testNextApi.post(resourceHandler, {
    customHeaders: { Authorization: `Bearer ${userJWT}` },
    body: { name: 'testResource3' },
  });

  expect(status).toBe(200);
});

test('should return 403 if permissions are inncorrect - POST', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  const { status } = await testNextApi.post(resourceHandler, { withJwt: true, body: { name: 'test' } });

  expect(status).toBe(403);
});
