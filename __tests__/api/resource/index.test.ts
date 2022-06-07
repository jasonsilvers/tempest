import { testNextApi } from '../../testutils/NextAPIUtils';
import resourceHandler from '../../../src/pages/api/resource';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { getResource } from '../../../src/repositories/resourceRepo';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/resourceRepo.ts');

const globalUserId = 1;

const resource = [
  { id: 1, name: 'authorityrecords' },
  { id: 2, name: 'admin' },
  { id: 3, name: 'dashboard' },
  { id: 4, name: 'profile' },
  { id: 5, name: 'mattermost' },
  { id: 6, name: 'membertrackingrecord' },
  { id: 7, name: 'membertrackingitem' },
  { id: 8, name: 'organization' },
  { id: 9, name: 'record' },
  { id: 10, name: 'traineerecords' },
  { id: 11, name: 'trackingitem' },
  { id: 12, name: 'user' },
  { id: 13, name: 'role' },
  { id: 14, name: 'upload' },
];

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  mockMethodAndReturn(getResource, resource);
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
  const { status } = await testNextApi.post(resourceHandler, { withJwt: true, body: {} });

  expect(status).toBe(405);
});
