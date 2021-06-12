import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { grants } from '../../utils/mocks/fixtures';
import { mockMethodAndReturn } from '../../utils/mocks/repository';
import memberTrackingRecordIdHandler from '../../../src/pages/api/membertrackingrecords/[id]';
import { testNextApi } from '../../utils/NextAPIUtils';
import { findMemberTrackingRecordById } from '../../../src/repositories/memberTrackingRepo';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/memberTrackingRepo.ts');

const memberTrackingRecordFromDb = {
  id: 1,
  order: 0,
  trackingItemId: 1,
  traineeId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  authorityId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
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
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);
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

test('GET - should return membertrackingrecord - read any', async () => {
  const expectedResult = { ...memberTrackingRecordFromDb, trackingItem: trackingItemFromDb };
  mockMethodAndReturn(findMemberTrackingRecordById, expectedResult);
  const { status, data } = await testNextApi.get(memberTrackingRecordIdHandler, { urlId: 1 });

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedResult);
});

test('GET - should return membertrackingrecord - read own', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
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
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  const expectedResult = { ...memberTrackingRecordFromDb, trackingItem: trackingItemFromDb };
  mockMethodAndReturn(findMemberTrackingRecordById, expectedResult);
  const { status } = await testNextApi.get(memberTrackingRecordIdHandler, { urlId: 1 });

  expect(status).toBe(403);
});

test('should only allow GET', async () => {
  const { status } = await testNextApi.put(memberTrackingRecordIdHandler, { body: {} });

  expect(status).toBe(409);
});
