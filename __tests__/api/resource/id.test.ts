import { testNextApi } from '../../testutils/NextAPIUtils';
import resourcesApiHandler from '../../../src/pages/api/resource/[id]';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { deleteResource } from '../../../src/repositories/resourceRepo';
import { adminJWT, userJWT } from '../../testutils/mocks/mockJwt';
import { findGrants } from '../../../src/repositories/grantsRepo';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/resourceRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');

const globalUserId = 1;

const resource = [
  { id: 1, name: 'testReource1' },
  { id: 2, name: 'testResource2' },
];
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
// Test returning 403 status code should be returning 200 when successful
test('should delete resource', async () => {
  mockMethodAndReturn(deleteResource, resource[0]);

  const { status, data } = await testNextApi.delete(resourcesApiHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
    urlId: '1',
  });

  expect(status).toBe(200);

  expect(data).toStrictEqual({ message: 'ok' });
});

test('should return 403 if not admin', async () => {
  const { status } = await testNextApi.get(resourcesApiHandler, {
    customHeaders: { Authorization: `Bearer ${userJWT}` },
  });

  expect(status).toBe(403);
});

test('should return 405 if method not allowed', async () => {
  const { status } = await testNextApi.post(resourcesApiHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
    body: {},
  });

  expect(status).toBe(405);
});
