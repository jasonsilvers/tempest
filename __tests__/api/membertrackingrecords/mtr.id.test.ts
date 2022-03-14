/*
 * @jest-environment node
 */

import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import memberTrackingRecordIdHandler from '../../../src/pages/api/membertrackingrecords/[id]';
import { testNextApi } from '../../testutils/NextAPIUtils';
import {
  findMemberTrackingRecordById,
  deleteMemberTrackingRecord,
  countMemberTrackingRecordsForMemberTrackingItem,
  deleteMemberTrackingItem,
} from '../../../src/repositories/memberTrackingRepo';
import { userHasPermissionWithinOrg } from '../../../src/utils/userHasPermissionWithinOrg';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/memberTrackingRepo.ts');
jest.mock('../../../src/utils/userHasPermissionWithinOrg.ts');

const memberTrackingRecordFromDb = {
  id: 1,
  order: 0,
  trackingItemId: 1,
  traineeId: 1,
  trainee: {
    id: 1,
    organizationId: '123',
  },
  authorityId: 2,
  memberTrackingItem: {
    user: {
      id: 2,
      organizationId: '123',
    },
  },
  authoritySignedDate: null,
  traineeSignedDate: null,
  completedDate: null,
};

const trackingItemFromDb = {
  id: 1,
  title: 'Fire Extinguisher',
  description: 'This is a test item',
  interval: 365,
};

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);
  mockMethodAndReturn(userHasPermissionWithinOrg, true);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should return 401 if not Authorized', async () => {
  const { status } = await testNextApi.get(memberTrackingRecordIdHandler, {
    withJwt: false,
  });

  expect(status).toBe(401);
});

test('should return 404 if record not found', async () => {
  const expectedResult = null;
  mockMethodAndReturn(findMemberTrackingRecordById, expectedResult);
  const { status, data } = await testNextApi.get(memberTrackingRecordIdHandler, { urlId: 1 });

  expect(status).toBe(404);
  expect(data).toStrictEqual({ message: 'The requested entity could not be found' });
});

test('GET - should return membertrackingrecord - read any', async () => {
  const expectedResult = { ...memberTrackingRecordFromDb, trackingItem: trackingItemFromDb };
  mockMethodAndReturn(findMemberTrackingRecordById, expectedResult);
  const { status, data } = await testNextApi.get(memberTrackingRecordIdHandler, { urlId: 1 });

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedResult);
});

test('GET - should return 403 if member not in monitors organization - read any', async () => {
  const expectedResult = { ...memberTrackingRecordFromDb, trackingItem: trackingItemFromDb };
  mockMethodAndReturn(findMemberTrackingRecordById, expectedResult);
  mockMethodAndReturn(userHasPermissionWithinOrg, false);
  const { status } = await testNextApi.get(memberTrackingRecordIdHandler, { urlId: 1 });

  expect(status).toBe(403);
});

test('GET - should return membertrackingrecord - read own', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  const expectedResult = { ...memberTrackingRecordFromDb, trackingItem: trackingItemFromDb };
  mockMethodAndReturn(findMemberTrackingRecordById, expectedResult);
  const { status, data } = await testNextApi.get(memberTrackingRecordIdHandler, { urlId: 1 });

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedResult);
});

test('GET - should return 403 if not correct permissions', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  const expectedResult = { ...memberTrackingRecordFromDb, trackingItem: trackingItemFromDb };
  mockMethodAndReturn(findMemberTrackingRecordById, expectedResult);
  const { status } = await testNextApi.get(memberTrackingRecordIdHandler, { urlId: 1 });

  expect(status).toBe(403);
});

test('DELETE - should return 403 if not allowed', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });

  const expectedResult = { ...memberTrackingRecordFromDb, trackingItem: trackingItemFromDb };
  mockMethodAndReturn(findMemberTrackingRecordById, expectedResult);

  const { status } = await testNextApi.delete(memberTrackingRecordIdHandler, {
    urlId: '1',
  });

  expect(status).toBe(403);
});

test('DELETE - should return 403 if not allowed - read own', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  const expectedResult = { ...memberTrackingRecordFromDb, trackingItem: trackingItemFromDb };
  mockMethodAndReturn(findMemberTrackingRecordById, expectedResult);

  const { status } = await testNextApi.delete(memberTrackingRecordIdHandler, {
    urlId: '1',
  });

  expect(status).toBe(403);
});

test('DELETE - should delete record and tracking item- read own', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  const expectedResult = { ...memberTrackingRecordFromDb, trackingItem: trackingItemFromDb };
  mockMethodAndReturn(findMemberTrackingRecordById, expectedResult);
  mockMethodAndReturn(deleteMemberTrackingRecord, expectedResult);
  mockMethodAndReturn(countMemberTrackingRecordsForMemberTrackingItem, { _count: { trackingItemId: 0 } });

  const { status, data } = await testNextApi.delete(memberTrackingRecordIdHandler, {
    urlId: '1',
  });

  expect(deleteMemberTrackingItem).toBeCalled();

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedResult);
});

test('DELETE - should delete record only - read own', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  const expectedResult = { ...memberTrackingRecordFromDb, trackingItem: trackingItemFromDb };
  mockMethodAndReturn(findMemberTrackingRecordById, expectedResult);
  mockMethodAndReturn(deleteMemberTrackingRecord, expectedResult);
  mockMethodAndReturn(countMemberTrackingRecordsForMemberTrackingItem, { _count: { trackingItemId: 2 } });

  const { status, data } = await testNextApi.delete(memberTrackingRecordIdHandler, {
    urlId: '1',
  });

  expect(deleteMemberTrackingItem).not.toBeCalled();

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedResult);
});

test('should return method not allowed', async () => {
  const expectedResult = { ...memberTrackingRecordFromDb, trackingItem: trackingItemFromDb };

  mockMethodAndReturn(findMemberTrackingRecordById, expectedResult);

  const { status } = await testNextApi.put(memberTrackingRecordIdHandler, { body: { urlId: 1 } });

  expect(status).toBe(405);
});
