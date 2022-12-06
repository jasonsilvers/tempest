import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import trackingItemSlugHandler from '../../../src/pages/api/tempest/trackingitems/[...slug]';
import { testNextApi } from '../../testutils/NextAPIUtils';
import { findTrackingByIdIncludeCount, updateTrackingItem } from '../../../src/repositories/trackingItemRepo';
import { updateManyMemberTrackingItemsByTrackingItemId } from '../../../src/repositories/memberTrackingRepo';
import { TrackingItemStatus } from '@prisma/client';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/trackingItemRepo.ts');
jest.mock('../../../src/repositories/memberTrackingRepo.ts');

const globalUserId = 1;

const trackingItemFromDb = {
  id: 18,
  title: 'Fire Safety',
  description: 'How to be SAFE when using Fire',
  interval: 90,
  organizationId: null,
  status: 'INACTIVE',
  location: null,
  _count: {
    memberTrackingItem: 0,
  },
};

const inactiveTrackingItem = {
  ...trackingItemFromDb,
  status: TrackingItemStatus.INACTIVE,
};

const activeTrackingItem = {
  ...trackingItemFromDb,
  status: TrackingItemStatus.ACTIVE,
};
beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should return 400 if url is incorrect', async () => {
  const { status } = await testNextApi.post(trackingItemSlugHandler, {
    body: {},
    urlSlug: '23/aasdaslkj',
  });

  expect(status).toBe(400);
});

test('should return 401 if not authorized', async () => {
  const { status } = await testNextApi.get(trackingItemSlugHandler, { withJwt: false });

  expect(status).toBe(401);
});

test('should return 403 if member tries to archive training item', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '19', name: 'member' },
  });

  const findTrackingByIdIncludeCountSpy = mockMethodAndReturn(findTrackingByIdIncludeCount, {
    ...inactiveTrackingItem,
    organizationId: 2,
  });

  const { status, data } = await testNextApi.post(trackingItemSlugHandler, {
    body: {},
    urlSlug: '18/archive',
  });

  expect(findTrackingByIdIncludeCountSpy).toBeCalled();

  expect(status).toBe(403);
  expect(data).toStrictEqual({ message: 'You do not have permission to perform this action' });
});

test('should return 403 if monitor tries to update global item', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '19', name: 'monitor' },
  });

  const findTrackingByIdIncludeCountSpy = mockMethodAndReturn(findTrackingByIdIncludeCount, inactiveTrackingItem);

  const { status, data } = await testNextApi.post(trackingItemSlugHandler, {
    body: {},
    urlSlug: '18/archive',
  });

  expect(findTrackingByIdIncludeCountSpy).toBeCalled();

  expect(status).toBe(403);
  expect(data).toStrictEqual({ message: 'You are not authorized to update training items in the global catalog' });
});

test('should return 404 if training item not found ', async () => {
  mockMethodAndReturn(findTrackingByIdIncludeCount, null);
  const { status, data } = await testNextApi.post(trackingItemSlugHandler, { body: {}, urlSlug: '0/unarchive' });

  expect(status).toBe(404);
  expect(data).toStrictEqual({ message: 'The requested entity could not be found' });
});

test('shold return 405 for incorrect method', async () => {
  const { status } = await testNextApi.get(trackingItemSlugHandler, {
    urlSlug: '6/archive',
  });

  expect(status).toEqual(405);
});

test('shouold archive a training item', async () => {
  const dbSpy = mockMethodAndReturn(findTrackingByIdIncludeCount, trackingItemFromDb);
  const inactiveSpy = mockMethodAndReturn(updateTrackingItem, inactiveTrackingItem);
  const updateSpy = mockMethodAndReturn(updateManyMemberTrackingItemsByTrackingItemId, null);

  const { status, data } = await testNextApi.post(trackingItemSlugHandler, { body: {}, urlSlug: '18/archive' });

  expect(dbSpy).toBeCalledWith(18);
  expect(inactiveSpy).toBeCalledWith(18, { status: 'INACTIVE' });
  expect(updateSpy).toBeCalledWith(18, { status: 'INACTIVE' });
  expect(status).toBe(200);
  expect(JSON.stringify(data)).toEqual(JSON.stringify(inactiveTrackingItem));
});

test('should unarchive training item', async () => {
  const dbSpy = mockMethodAndReturn(findTrackingByIdIncludeCount, trackingItemFromDb);
  const activeSpy = mockMethodAndReturn(updateTrackingItem, activeTrackingItem);
  const updateSpy = mockMethodAndReturn(updateManyMemberTrackingItemsByTrackingItemId, null);

  const { status, data } = await testNextApi.post(trackingItemSlugHandler, { body: {}, urlSlug: '18/unarchive' });

  expect(dbSpy).toBeCalledWith(18);
  expect(activeSpy).toBeCalledWith(18, { status: 'ACTIVE' });
  expect(updateSpy).toBeCalledWith(18, { status: 'ACTIVE' });
  expect(status).toBe(200);
  expect(JSON.stringify(data)).toEqual(JSON.stringify(activeTrackingItem));
});
