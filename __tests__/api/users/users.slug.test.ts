import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId, findUserByIdWithMemberTrackingItems } from '../../../src/repositories/userRepo';
import { grants } from '../../utils/mocks/fixtures';
import { mockMethodAndReturn } from '../../utils/mocks/repository';
import userSlugHandler from '../../../src/pages/api/users/[...slug]';
import { testNextApi } from '../../utils/NextAPIUtils';
import dayjs from 'dayjs';
import { EUserIncludes } from '../../../src/const/enums';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/grantsRepo.ts');

const userFromDb = {
  id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  firstName: 'joe',
  lastName: 'anderson',
  role: { id: '22', name: 'monitor' },
};

const completeRecord = {
  id: 2,
  authoritySignedDate: dayjs('04-20-2021').toISOString(),
  authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  traineeSignedDate: dayjs('04-20-2021').toISOString(),
  traineeId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  completedDate: dayjs('04-19-2021').toISOString(),
  successorId: null,
  trackingItemId: 2,
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

test('GET - should return member tracking items', async () => {
  const recordFromDb = {
    ...userFromDb,
    trackingItems: [
      {
        isActive: true,
        userId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
        trackingItemId: 23,
      },
      {
        isActive: true,
        userId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
        trackingItemId: 14,
      },
    ],
  };
  mockMethodAndReturn(findUserByIdWithMemberTrackingItems, recordFromDb);
  const { data, status } = await testNextApi.get(userSlugHandler, {
    urlSlug: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2/membertrackingitems',
  });

  expect(findUserByIdWithMemberTrackingItems).toBeCalledWith('a100e2fa-50d0-49a6-b10f-00adde24d0c2', null);
  expect(status).toBe(200);
  expect(data).toStrictEqual(recordFromDb);
});

test('GET - should return member tracking items.  member tracking records and tracking items', async () => {
  const recordFromDb = {
    ...userFromDb,
    trackingItems: [
      {
        isActive: true,
        userId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
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
        userId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
        trackingItemId: 14,
      },
    ],
  };
  mockMethodAndReturn(findUserByIdWithMemberTrackingItems, recordFromDb);
  const { data, status } = await testNextApi.get(userSlugHandler, {
    urlSlug: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2/membertrackingitems?include=trackingitems',
  });

  expect(findUserByIdWithMemberTrackingItems).toBeCalledWith(
    'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    EUserIncludes.TRACKING_ITEMS
  );
  expect(status).toBe(200);
  expect(data).toStrictEqual(recordFromDb);
});

test('should return 401 if not authorized', async () => {
  const { status } = await testNextApi.get(userSlugHandler, {
    withJwt: false,
    urlSlug: '/a100e2fa-50d0-49a6-b10f-00adde24d0c2/membertrackingitems?include=membertrackingrecords',
  });

  expect(status).toBe(401);
});

test('should return 403 if not correct permissions', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  const { status } = await testNextApi.get(userSlugHandler, {
    urlSlug: '/a100e2fa-50d0-49a6-b10f-00adde24d0c2/membertrackingitems?include=membertrackingrecords',
  });

  expect(status).toBe(403);
});

test('should return 403 if member and not own record', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  const { status } = await testNextApi.get(userSlugHandler, {
    urlSlug: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2/membertrackingitems?include=membertrackingrecords',
  });

  expect(status).toBe(403);
});

test('should return user if own record', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  const recordFromDb = {
    ...userFromDb,
    trackingItems: [
      {
        isActive: true,
        userId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
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
        userId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
        trackingItemId: 14,
      },
    ],
  };
  mockMethodAndReturn(findUserByIdWithMemberTrackingItems, recordFromDb);
  const { data, status } = await testNextApi.get(userSlugHandler, {
    urlSlug: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2/membertrackingitems',
  });

  expect(findUserByIdWithMemberTrackingItems).toBeCalledWith('a100e2fa-50d0-49a6-b10f-00adde24d0c2', null);
  expect(status).toBe(200);
  expect(data).toStrictEqual(recordFromDb);
});

test('GET - should return 404 if incorrect resource', async () => {
  const { status } = await testNextApi.get(userSlugHandler, {
    urlSlug: '/a100e2fa-50d0-49a6-b10f-00adde24d0c2/noresource',
  });

  expect(status).toBe(404);
});

test('should return 404 if user not found', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findUserByIdWithMemberTrackingItems, null);
  const { status } = await testNextApi.get(userSlugHandler, {
    urlSlug:
      'a100e2fa-50d0-49a6-b10f-00adde24d0c2/membertrackingitems?include=membertrackingrecords&include=trackingitems',
  });

  expect(status).toBe(404);
});

test('Should not accept DELETE', async () => {
  const id = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

  mockMethodAndReturn(findUserByDodId, {
    id,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);

  const { status } = await testNextApi.delete(userSlugHandler);

  expect(status).toEqual(405);
});

test('Should not accept PUT', async () => {
  const id = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

  mockMethodAndReturn(findUserByDodId, {
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
  const id = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

  mockMethodAndReturn(findUserByDodId, {
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
