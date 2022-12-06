/*
 * @jest-environment node
 */

import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import trackingItemHandler from '../../../src/pages/api/tempest/trackingitems';
import { testNextApi } from '../../testutils/NextAPIUtils';
import {
  createTrackingItem,
  getGlobalTrackingItemsAndThoseByOrgId,
  getTrackingItems,
} from '../../../src/repositories/trackingItemRepo';
import { getOrganizationAndDown, getOrganizationAndUp } from '../../../src/repositories/organizationRepo';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/roleRepo.ts');
jest.mock('../../../src/repositories/trackingItemRepo.ts');
jest.mock('../../../src/repositories/organizationRepo.ts');

export class MockPrismaError extends Error {
  readonly code: string;

  constructor(code: string) {
    super('MockPrismaError');
    this.code = code;
  }
}

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
  organizationId: 2,
};

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
    organizationId: '2',
  });
  mockMethodAndReturn(findGrants, grants);
  mockMethodAndReturn(getOrganizationAndDown, [
    {
      id: 2,
      org_name: '15th Medical Group',
      org_short_name: '15th MDG',
      parent_id: null,
      types: ['CATALOG'],
    },
    {
      id: 3,
      org_name: 'Force Support Squardron',
      org_short_name: 'FSS',
      parent_id: null,
      types: [],
    },
  ]);

  mockMethodAndReturn(getOrganizationAndUp, [
    {
      id: 1,
      org_name: '15th Wing',
      org_short_name: '15th Wg',
      parent_id: null,
      types: ['CATALOG'],
    },
    {
      id: 2,
      org_name: '15th Medical Group',
      org_short_name: '15th MDG',
      parent_id: null,
      types: ['CATALOG'],
    },
  ]);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should return tracking items - MONITOR - GET', async () => {
  mockMethodAndReturn(getGlobalTrackingItemsAndThoseByOrgId, [trackingItemFromDb]);

  const { status, data } = await testNextApi.get(trackingItemHandler);

  expect(status).toBe(200);
  expect(data).toStrictEqual({ trackingItems: [trackingItemFromDb] });
});

test('should return tracking items - ADMIN - GET', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
    organizationId: '2',
  });
  mockMethodAndReturn(getTrackingItems, [trackingItemFromDb]);

  const { status, data } = await testNextApi.get(trackingItemHandler);

  expect(status).toBe(200);
  expect(data).toStrictEqual({ trackingItems: [trackingItemFromDb] });
});

test('should return tracking items - MEMBER - GET', async () => {
  const getOrganizationAndDownSpy = mockMethodAndReturn(getOrganizationAndDown, [
    {
      id: 2,
      org_name: '15th Medical Group',
      org_short_name: '15th MDG',
      parent_id: null,
      types: ['CATALOG'],
    },
    {
      id: 3,
      org_name: 'Force Support Squardron',
      org_short_name: 'FSS',
      parent_id: null,
      types: [],
    },
  ]);

  const getOrganizationAndUpSpy = mockMethodAndReturn(getOrganizationAndUp, [
    {
      id: 1,
      org_name: '15th Wing',
      org_short_name: '15th Wg',
      parent_id: null,
      types: ['CATALOG'],
    },
    {
      id: 2,
      org_name: '15th Medical Group',
      org_short_name: '15th MDG',
      parent_id: null,
      types: ['CATALOG'],
    },
  ]);
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: '2',
  });
  mockMethodAndReturn(getGlobalTrackingItemsAndThoseByOrgId, [trackingItemFromDb]);

  const { status, data } = await testNextApi.get(trackingItemHandler);

  expect(getOrganizationAndDownSpy).not.toHaveBeenCalled();
  expect(getOrganizationAndUpSpy).toHaveBeenCalled();

  expect(status).toBe(200);
  expect(data).toStrictEqual({ trackingItems: [trackingItemFromDb] });
});
test('should return 403 if incorrect permissions - GET', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
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
test('should create new global tracking item', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
    organizationId: 2,
  });
  mockMethodAndReturn(createTrackingItem, { ...newTrackingItem, id: newTrackingItemId });
  const { status, data } = await testNextApi.post(trackingItemHandler, {
    body: { ...newTrackingItem, organizationId: null },
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ ...newTrackingItem, id: newTrackingItemId });
});

test('should create new tracking item for org with catalog', async () => {
  mockMethodAndReturn(createTrackingItem, { ...newTrackingItem, id: newTrackingItemId });
  const { status, data } = await testNextApi.post(trackingItemHandler, { body: newTrackingItem });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ ...newTrackingItem, id: newTrackingItemId });
});

test('should return 403 if monitor tries to create global training item', async () => {
  const createTrackingItemSpy = mockMethodAndReturn(createTrackingItem, { ...newTrackingItem, id: newTrackingItemId });
  const { status } = await testNextApi.post(trackingItemHandler, {
    body: { ...newTrackingItem, organizationId: null },
  });

  expect(createTrackingItemSpy).not.toBeCalled();

  expect(status).toBe(403);
});

test('should return 403 if monitor tries to create training item in org that isnt CATALOG type', async () => {
  const createTrackingItemSpy = mockMethodAndReturn(createTrackingItem, { ...newTrackingItem, id: newTrackingItemId });
  const { status } = await testNextApi.post(trackingItemHandler, {
    body: { ...newTrackingItem, organizationId: 3 },
  });

  expect(createTrackingItemSpy).not.toBeCalled();

  expect(status).toBe(403);
});

test('should return 403 if monitor tries to create  training item in org they dont have access to', async () => {
  const getOrganizationAndDownSpy = mockMethodAndReturn(getOrganizationAndDown, [
    {
      id: 2,
      org_name: '15th Medical Group',
      org_short_name: '15th MDG',
      parent_id: null,
      types: ['CATALOG'],
    },
    {
      id: 3,
      org_name: 'Force Support Squardron',
      org_short_name: 'FSS',
      parent_id: null,
      types: [],
    },
  ]);

  const getOrganizationAndUpSpy = mockMethodAndReturn(getOrganizationAndUp, [
    {
      id: 1,
      org_name: '15th Wing',
      org_short_name: '15th Wg',
      parent_id: null,
      types: ['CATALOG'],
    },
    {
      id: 2,
      org_name: '15th Medical Group',
      org_short_name: '15th MDG',
      parent_id: null,
      types: ['CATALOG'],
    },
  ]);
  const createTrackingItemSpy = mockMethodAndReturn(createTrackingItem, { ...newTrackingItem, id: newTrackingItemId });
  const { status } = await testNextApi.post(trackingItemHandler, {
    body: { ...newTrackingItem, organizationId: 5 },
  });

  expect(getOrganizationAndDownSpy).toBeCalled();
  expect(getOrganizationAndUpSpy).not.toBeCalled();

  expect(createTrackingItemSpy).not.toBeCalled();

  expect(status).toBe(403);
});

test('should return 400 if request body is not valid', async () => {
  mockMethodAndReturn(createTrackingItem, { ...newTrackingItem, id: newTrackingItemId });
  const { status, data } = await testNextApi.post(trackingItemHandler, { body: { ...newTrackingItem, title: 329 } });

  expect(status).toBe(400);
  expect(data).toStrictEqual({ message: 'Bad Request' });
});

test('should return 403 if incorrect permissions - POST', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: '2',
  });
  const { status } = await testNextApi.post(trackingItemHandler, { body: newTrackingItem });

  expect(status).toBe(403);
});

test('should return 500 if duplicate - POST', async () => {
  const mockedCreateTrackingItem = createTrackingItem as jest.MockedFunction<typeof createTrackingItem>;

  mockedCreateTrackingItem.mockImplementation(() => {
    throw new MockPrismaError('P2002');
  });

  const { status, data } = await testNextApi.post(trackingItemHandler, { body: newTrackingItem });

  expect(status).toBe(500);
  expect(data).toStrictEqual({ message: 'Duplicates not allowed' });
});

test('should handle create tracking item error - POST', async () => {
  const mockedCreateTrackingItem = createTrackingItem as jest.MockedFunction<typeof createTrackingItem>;

  mockedCreateTrackingItem.mockImplementation(() => {
    throw new MockPrismaError('P2001');
  });

  const { status, data } = await testNextApi.post(trackingItemHandler, { body: newTrackingItem });

  expect(status).toBe(500);
  expect(data).toStrictEqual({ message: 'An error occured. Please try again' });
});

test('should return 405 if method not allowed', async () => {
  const { status } = await testNextApi.put(trackingItemHandler, { body: newTrackingItem });

  expect(status).toBe(405);
});
