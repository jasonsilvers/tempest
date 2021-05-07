import { findGrants } from '../../../src/repositories/grantsRepo';
import memberTrackingItemHandlerSlug from '../../../src/pages/api/membertrackingitem/[slug]';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { grants } from '../../utils/mocks/fixtures';
import mockMethod from '../../utils/mocks/repository';
import testNextApi from '../../utils/NextAPIUtils';
import {
  deleteMemberTrackingItem,
  findMemberTrackingItemById,
  findMemberTrackingRecordById,
  findMemberTrackingRecords,
} from '../../../src/repositories/memberTrackingRepo';
import dayjs from 'dayjs';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/memberTrackingRepo.ts');

const trackingItemFromDb = {
  userId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  trackingItemId: 2,
  isActive: true,
};

beforeEach(() => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('it should delete the member tracking item', async () => {
  const userId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;
  mockMethod(findMemberTrackingItemById, trackingItemFromDb);
  mockMethod(deleteMemberTrackingItem, {});
  mockMethod(findMemberTrackingRecords, []);
  const { status } = await testNextApi.delete(memberTrackingItemHandlerSlug, {
    urlSlug: `/${trackingItemId}/user/${userId}`,
  });

  expect(deleteMemberTrackingItem).toBeCalledWith(trackingItemId, userId);
  expect(status).toBe(204);
});
test('it should not delete the member tracking item if it has any tracking records', async () => {
  const userId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

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

  mockMethod(findMemberTrackingItemById, trackingItemFromDb);
  mockMethod(findMemberTrackingRecords, [completeRecord]);

  const { status } = await testNextApi.delete(memberTrackingItemHandlerSlug, {
    urlSlug: `/${trackingItemId}/user/${userId}`,
  });

  expect(deleteMemberTrackingItem).not.toBeCalled();
  expect(status).toBe(409);
});

test('should not allow delete if user not authorized', async () => {
  const userId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;
  const { status } = await testNextApi.delete(memberTrackingItemHandlerSlug, {
    urlSlug: `/${trackingItemId}/user/${userId}`,
    withJwt: false,
  });

  expect(status).toBe(401);
});
test('should not allow delete if user does not have correct permission', async () => {
  const userId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });

  mockMethod(findMemberTrackingItemById, trackingItemFromDb);

  const { status } = await testNextApi.delete(memberTrackingItemHandlerSlug, {
    urlSlug: `/${trackingItemId}/user/${userId}`,
  });

  expect(status).toBe(403);
});
test('should not allow delete if user is a member and does not own the record', async () => {
  const userId = 'b100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  const trackingItemFromDb = {
    userId,
    trackingItemId,
    isActive: true,
  };

  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  mockMethod(findMemberTrackingItemById, trackingItemFromDb);

  const { status } = await testNextApi.delete(memberTrackingItemHandlerSlug, {
    urlSlug: `/${trackingItemId}/user/${userId}`,
  });

  expect(status).toBe(403);
});

test('should return 404 if record is not found', async () => {
  const userId = 'b100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  mockMethod(findMemberTrackingItemById, null);

  const { status } = await testNextApi.delete(memberTrackingItemHandlerSlug, {
    urlSlug: `/${trackingItemId}/user/${userId}`,
  });

  expect(status).toBe(404);
});

test('Should not accept GET', async () => {
  const userId = 'b100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  mockMethod(findUserByDodId, {
    id: userId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const { status } = await testNextApi.get(memberTrackingItemHandlerSlug, {
    urlSlug: `/${trackingItemId}/user/${userId}`,
  });

  expect(status).toEqual(405);
});

test('Should not accept POST', async () => {
  const userId = 'b100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  mockMethod(findUserByDodId, {
    id: userId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const { status } = await testNextApi.post(memberTrackingItemHandlerSlug, {
    urlSlug: `/${trackingItemId}/user/${userId}`,
    body: {},
  });

  expect(status).toEqual(405);
});

test('Should not accept PUT', async () => {
  const userId = 'b100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  mockMethod(findUserByDodId, {
    id: userId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const { status } = await testNextApi.put(memberTrackingItemHandlerSlug, {
    urlSlug: `/${trackingItemId}/user/${userId}`,
    body: {},
  });

  expect(status).toEqual(405);
});
