import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { grants } from '../../utils/mocks/fixtures';
import { mockMethodAndReturn } from '../../utils/mocks/repository';
import trackingItemHandler from '../../../src/pages/api/trackingitems';
import { testNextApi } from '../../utils/NextAPIUtils';
import { getTrackingItems, createTrackingItem } from '../../../src/repositories/trackingItemRepo';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/roleRepo.ts');
jest.mock('../../../src/repositories/trackingItemRepo.ts');

const trackingItemFromDb = {
  id: 1,
  title: 'Fire Extinguisher',
  description: 'This is a test item',
  interval: 365,
};

const newTrackingItemId = 2;

const newTrackingItem = {
  title: 'Fire Extinguisher',
  description: 'This is a test item',
  interval: 365,
};

beforeEach(() => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
    organizationId: '2',
  });
  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should return tracking items - GET', async () => {
  mockMethodAndReturn(getTrackingItems, [trackingItemFromDb]);

  const { status, data } = await testNextApi.get(trackingItemHandler);

  expect(status).toBe(200);
  expect(data).toStrictEqual({ trackingItems: [trackingItemFromDb] });
});
test('should return 403 if incorrect permissions - GET', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
    organizationId: '2',
  });
  const { status } = await testNextApi.get(trackingItemHandler);

  expect(status).toBe(403);
});
test('should return 401 if not authorized', async () => {
  const { status } = await testNextApi.get(trackingItemHandler, { withJwt: false });

  expect(status).toBe(401);
});
test('should create new tracking item', async () => {
  mockMethodAndReturn(createTrackingItem, { ...newTrackingItem, id: newTrackingItemId });
  const { status, data } = await testNextApi.post(trackingItemHandler, { body: newTrackingItem });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ ...newTrackingItem, id: newTrackingItemId });
});

test('should return 400 if request body is not valid', async () => {
  mockMethodAndReturn(createTrackingItem, { ...newTrackingItem, id: newTrackingItemId });
  const { status, data } = await testNextApi.post(trackingItemHandler, { body: { ...newTrackingItem, title: 329 } });

  expect(status).toBe(400);
  expect(data).toStrictEqual({ message: 'Bad Request' });
});

test('should return 403 if incorrect permissions - POST', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: '2',
  });
  const { status } = await testNextApi.post(trackingItemHandler, { body: newTrackingItem });

  expect(status).toBe(403);
});
test('should return 405 if method not allowed', async () => {
  const { status } = await testNextApi.put(trackingItemHandler, { body: newTrackingItem });

  expect(status).toBe(405);
});