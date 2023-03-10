/*
 * @jest-environment node
 */

import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByEmail, findUserById, findUserByIdWithMemberTrackingItems } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import userSlugHandler from '../../../src/pages/api/tempest/users/[...slug]';
import { testNextApi } from '../../testutils/NextAPIUtils';
import dayjs from 'dayjs';
import { EMtrVariant, EUserResources } from '../../../src/const/enums';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/grantsRepo.ts');

const userFromDb = {
  id: 1,
  firstName: 'joe',
  lastName: 'anderson',
  role: { id: '22', name: 'monitor' },
};

const completeRecord = {
  id: 2,
  authoritySignedDate: dayjs('04-20-2021').toISOString(),
  authorityId: 1,
  traineeSignedDate: dayjs('04-20-2021').toISOString(),
  traineeId: 1,
  completedDate: dayjs('04-19-2021').toISOString(),
  successorId: null,
  trackingItemId: 2,
};

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('GET - should return member tracking items', async () => {
  const recordFromDb = {
    ...userFromDb,
    trackingItems: [
      {
        isActive: true,
        userId: 1,
        trackingItemId: 23,
      },
      {
        isActive: true,
        userId: 1,
        trackingItemId: 14,
      },
    ],
  };
  mockMethodAndReturn(findUserByIdWithMemberTrackingItems, recordFromDb);
  const { data, status } = await testNextApi.get(userSlugHandler, {
    urlSlug: '1/membertrackingitems/all',
  });

  expect(findUserByIdWithMemberTrackingItems).toBeCalledWith(1, EUserResources.MEMBER_TRACKING_ITEMS, EMtrVariant.ALL);
  expect(status).toBe(200);
  expect(data).toStrictEqual(recordFromDb);
});

test('GET - should return member tracking items', async () => {
  const recordFromDb = {
    ...userFromDb,
    trackingItems: [
      {
        isActive: true,
        userId: 1,
        trackingItemId: 23,
      },
      {
        isActive: true,
        userId: 1,
        trackingItemId: 14,
      },
    ],
  };
  mockMethodAndReturn(findUserById, recordFromDb);
  const { data, status } = await testNextApi.get(userSlugHandler, {
    urlSlug: '1/',
  });
  expect(findUserByIdWithMemberTrackingItems).not.toBeCalled();
  expect(findUserById).toBeCalled();
  expect(status).toBe(200);
  expect(data).toStrictEqual(recordFromDb);
});

test('GET - should return member tracking items.  member tracking records and tracking items', async () => {
  const recordFromDb = {
    ...userFromDb,
    trackingItems: [
      {
        isActive: true,
        userId: 1,
        trackingItemId: 23,
        memberTrackingRecords: [
          {
            ...completeRecord,
            trackingItem: {
              id: 1,
              title: 'Fire Extinguisher',
              description: 'This is a test item',
              interval: 365,
            },
          },
        ],
      },
      {
        isActive: true,
        userId: 1,
        trackingItemId: 14,
      },
    ],
  };
  mockMethodAndReturn(findUserByIdWithMemberTrackingItems, recordFromDb);
  const { data, status } = await testNextApi.get(userSlugHandler, {
    urlSlug: '1/membertrackingitems/all',
  });

  expect(findUserByIdWithMemberTrackingItems).toBeCalledWith(1, EUserResources.MEMBER_TRACKING_ITEMS, EMtrVariant.ALL);
  expect(status).toBe(200);
  expect(data).toStrictEqual(recordFromDb);
});

test('should return 401 if not authorized', async () => {
  const { status } = await testNextApi.get(userSlugHandler, {
    withJwt: false,
    urlSlug: '1/membertrackingitems/all',
  });

  expect(status).toBe(401);
});

test('should return 403 if not correct permissions', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  const { status } = await testNextApi.get(userSlugHandler, {
    urlSlug: '1/membertrackingitems/all',
  });

  expect(status).toBe(403);
});

test('should return 403 if member and not own record', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  const { status } = await testNextApi.get(userSlugHandler, {
    urlSlug: '2/membertrackingitems/all',
  });

  expect(status).toBe(403);
});

test('should return user if own record', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  const recordFromDb = {
    ...userFromDb,
    trackingItems: [
      {
        isActive: true,
        userId: 1,
        trackingItemId: 23,
        memberTrackingRecords: [
          {
            ...completeRecord,
            trackingItem: {
              id: 1,
              title: 'Fire Extinguisher',
              description: 'This is a test item',
              interval: 365,
            },
          },
        ],
      },
      {
        isActive: true,
        userId: 1,
        trackingItemId: 14,
      },
    ],
  };
  mockMethodAndReturn(findUserByIdWithMemberTrackingItems, recordFromDb);
  const { data, status } = await testNextApi.get(userSlugHandler, {
    urlSlug: '1/membertrackingitems/all',
  });

  expect(findUserByIdWithMemberTrackingItems).toBeCalledWith(1, EUserResources.MEMBER_TRACKING_ITEMS, EMtrVariant.ALL);
  expect(status).toBe(200);
  expect(data).toStrictEqual(recordFromDb);
});

test('GET - should return 404 if incorrect resource', async () => {
  const { status } = await testNextApi.get(userSlugHandler, {
    urlSlug: '1/noresource',
  });

  expect(status).toBe(404);
});

test('GET - should return 400 if incorrect variant', async () => {
  const { status } = await testNextApi.get(userSlugHandler, {
    urlSlug: '1/membertrackingitems/badvariant',
  });

  expect(status).toBe(400);
});

test('should return 404 if user not found', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findUserByIdWithMemberTrackingItems, null);
  const { status } = await testNextApi.get(userSlugHandler, {
    urlSlug: '1/membertrackingitems/all',
  });

  expect(status).toBe(404);
});

test('Should not accept DELETE', async () => {
  const id = 1;

  mockMethodAndReturn(findUserByEmail, {
    id,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);

  const { status } = await testNextApi.delete(userSlugHandler);

  expect(status).toEqual(405);
});

test('Should not accept PUT', async () => {
  const id = 1;

  mockMethodAndReturn(findUserByEmail, {
    id: id,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);

  const { status } = await testNextApi.put(userSlugHandler, {
    body: { test: 'test' },
  });

  expect(status).toEqual(405);
});

test('Should not accept POST', async () => {
  const id = 1;

  mockMethodAndReturn(findUserByEmail, {
    id: id,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);

  const { status } = await testNextApi.post(userSlugHandler, {
    body: {},
  });

  expect(status).toEqual(405);
});
