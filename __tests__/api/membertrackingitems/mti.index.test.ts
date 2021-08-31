import { grants } from '../../utils/mocks/fixtures';
import { mockMethodAndReturn } from '../../utils/mocks/repository';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import {
  createMemberTrackingItem,
  createMemberTrackingRecord,
  deleteMemberTrackingItem,
  findMemberTrackingItemById,
  findMemberTrackingRecords,
  updateMemberTrackingItem,
} from '../../../src/repositories/memberTrackingRepo';
import { testNextApi } from '../../utils/NextAPIUtils';
import memberTrackingItemHandler from '../../../src/pages/api/membertrackingitems';
import dayjs from 'dayjs';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/memberTrackingRepo.ts');

const globalUserId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

const memberTrackingItemBody = {
  userId: globalUserId,
  trackingItemId: 2,
  isActive: true
};

const memberTrackingItemFromDb = {
  userId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
  trackingItemId: 2,
  isActive: true,
};

const trackingItemFromDb = {
  id: 2,
  title: 'Fire Extinguisher',
  description: 'This is a test item',
  interval: 365,
};

const memberTrackingRecordFromDb = {
  trackingItemId: 2,
  traineeId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
  authorityId: null,
  authoritySignedDate: null,
  traineeSignedDate: null,
  completedDate: dayjs('2020-5-14').toISOString(),
};

beforeEach(() => {
  mockMethodAndReturn(findUserByDodId, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('GET - should return membertrackingitem - (read-any)', async () => {
  const userId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;
  mockMethodAndReturn(findMemberTrackingItemById, memberTrackingItemFromDb);

  const { status, data } = await testNextApi.get(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}`,
  });

  expect(findMemberTrackingItemById).toBeCalledWith(trackingItemId, userId, {
    withMemberTrackingRecords: false,
    withTrackingItems: false,
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual(memberTrackingItemFromDb);
});

test('GET - should return membertrackingitem (read - own)', async () => {
  const userId = 'b100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  const memberTrackingItem = {
    userId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    trackingItemId: 2,
    isActive: true,
  };

  mockMethodAndReturn(findUserByDodId, {
    id: userId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  mockMethodAndReturn(findMemberTrackingItemById, memberTrackingItem);

  const { status } = await testNextApi.get(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}&include=membertrackingrecords&include=trackingitems`,
  });

  expect(status).toBe(200);
});

test('GET - should return membertrackingitem with membertrackingrecords', async () => {
  const userId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  const expectedResult = {
    ...memberTrackingRecordFromDb,
    memberTrackingRecords: [memberTrackingRecordFromDb],
  };
  mockMethodAndReturn(findMemberTrackingItemById, expectedResult);

  const { status, data } = await testNextApi.get(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}&include=membertrackingrecords`,
  });

  expect(findMemberTrackingItemById).toBeCalledWith(trackingItemId, userId, {
    withMemberTrackingRecords: true,
    withTrackingItems: false,
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedResult);
});

test('GET - should return membertrackingitem with membertrackingrecords and tracking items', async () => {
  const userId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  const expectedResult = {
    ...memberTrackingRecordFromDb,
    memberTrackingRecords: [{ ...memberTrackingRecordFromDb, trackingItem: trackingItemFromDb }],
  };
  mockMethodAndReturn(findMemberTrackingItemById, expectedResult);

  const { status, data } = await testNextApi.get(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}&include=membertrackingrecords&include=trackingitems`,
  });

  expect(findMemberTrackingItemById).toBeCalledWith(trackingItemId, userId, {
    withMemberTrackingRecords: true,
    withTrackingItems: true,
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedResult);
});

test('GET - should return 404 if record not found', async () => {
  const userId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  mockMethodAndReturn(findMemberTrackingItemById, null);

  const { status } = await testNextApi.get(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}&include=membertrackingrecords&include=trackingitems`,
  });

  expect(findMemberTrackingItemById).toBeCalledWith(trackingItemId, userId, {
    withMemberTrackingRecords: true,
    withTrackingItems: true,
  });

  expect(status).toBe(404);
});

test('GET - should return 403 if incorrect permission (read - any)', async () => {
  const userId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;
  mockMethodAndReturn(findUserByDodId, {
    id: userId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  mockMethodAndReturn(findMemberTrackingItemById, {});

  const { status } = await testNextApi.get(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}&include=membertrackingrecords&include=trackingitems`,
  });

  expect(status).toBe(403);
});

test('GET - should return 403 if incorrect permission (read - own)', async () => {
  const userId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  const memberTrackingItem = {
    userId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    trackingItemId: 2,
    isActive: true,
  };

  mockMethodAndReturn(findUserByDodId, {
    id: userId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  mockMethodAndReturn(findMemberTrackingItemById, memberTrackingItem);

  const { status } = await testNextApi.get(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}&include=membertrackingrecords&include=trackingitems`,
  });

  expect(status).toBe(403);
});

test('DELETE - it should delete the member tracking item (delete any)', async () => {
  const userId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;
  mockMethodAndReturn(findMemberTrackingItemById, memberTrackingItemFromDb);
  mockMethodAndReturn(deleteMemberTrackingItem, {});
  mockMethodAndReturn(findMemberTrackingRecords, []);
  const { status } = await testNextApi.delete(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}`,
  });

  expect(deleteMemberTrackingItem).toBeCalledWith(trackingItemId, userId);
  expect(status).toBe(204);
});

test('DELETE - it should delete the member tracking item (delete own)', async () => {
  const userId = 'b100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  mockMethodAndReturn(findMemberTrackingItemById, memberTrackingItemFromDb);
  mockMethodAndReturn(findMemberTrackingRecords, []);
  mockMethodAndReturn(deleteMemberTrackingItem, {});
  const { status } = await testNextApi.delete(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}`,
  });

  expect(deleteMemberTrackingItem).toBeCalledWith(trackingItemId, userId);
  expect(status).toBe(204);
});
test('DELETE - it should not delete the member tracking item if it has any tracking records', async () => {
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

  mockMethodAndReturn(findMemberTrackingItemById, memberTrackingItemFromDb);
  mockMethodAndReturn(findMemberTrackingRecords, [completeRecord]);

  const { status } = await testNextApi.delete(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}`,
  });

  expect(deleteMemberTrackingItem).not.toBeCalled();
  expect(status).toBe(409);
});

test('DELETE - should not allow delete if user not authorized', async () => {
  const userId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;
  const { status } = await testNextApi.delete(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}`,
    withJwt: false,
  });

  expect(status).toBe(401);
});
test('DELETE - should not allow delete if user does not have correct permission', async () => {
  const userId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });

  mockMethodAndReturn(findMemberTrackingItemById, memberTrackingItemFromDb);

  const { status } = await testNextApi.delete(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}`,
  });

  expect(status).toBe(403);
});
test('DELETE - should not allow delete if user is a member and does not own the record', async () => {
  const userId = 'b100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  mockMethodAndReturn(findMemberTrackingItemById, {
    trackingItemFromDb: memberTrackingItemFromDb,
    userId,
  });

  const { status } = await testNextApi.delete(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}`,
  });

  expect(status).toBe(403);
});

test('DELETE - should return 404 if record is not found', async () => {
  const userId = 'b100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  mockMethodAndReturn(findMemberTrackingItemById, null);

  const { status } = await testNextApi.delete(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}`,
  });

  expect(status).toBe(404);
});

test('PUT - Should allow monitor to update isActive', async () => {
  const userId = 'b100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  mockMethodAndReturn(findUserByDodId, {
    id: userId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);

  const body = {
    isActive: false,
  };

  mockMethodAndReturn(findMemberTrackingItemById, { ...memberTrackingItemFromDb });
  mockMethodAndReturn(updateMemberTrackingItem, { ...memberTrackingItemFromDb, isActive: false });

  const { status, data } = await testNextApi.put(memberTrackingItemHandler, {
    urlId: `?userId=${userId}&trackingItemId=${trackingItemId}`,
    body,
  });

  expect(updateMemberTrackingItem).toHaveBeenCalledWith(
    memberTrackingItemFromDb.trackingItemId,
    memberTrackingItemFromDb.userId,
    {
      isActive: false,
    }
  );

  expect(status).toEqual(200);
  expect(data).toStrictEqual({...memberTrackingItemFromDb, isActive: false});
});

test('PUT - Should not allow update if role does not have permission', async () => {
  const userId = 'b100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  mockMethodAndReturn(findUserByDodId, {
    id: userId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findGrants, grants);

  const body = {
    isActive: false,
  };

  mockMethodAndReturn(findMemberTrackingItemById, { ...memberTrackingItemFromDb });
  mockMethodAndReturn(updateMemberTrackingItem, {...memberTrackingItemFromDb, isActive: false});

  const { status } = await testNextApi.put(memberTrackingItemHandler, {
    urlSlug: `/${trackingItemId}/user/${userId}`,
    body,
  });

  expect(status).toEqual(403);
});

test('PUT - Should return 404 is record not found', async () => {
  const userId = 'b100e2fa-50d0-49a6-b10f-00adde24d0c2';
  const trackingItemId = 2;

  mockMethodAndReturn(findUserByDodId, {
    id: userId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethodAndReturn(findGrants, grants);

  const body = {
    isActive: false,
  };

  mockMethodAndReturn(findMemberTrackingItemById, null);
  expect(updateMemberTrackingItem).not.toBeCalled();

  const { status } = await testNextApi.put(memberTrackingItemHandler, {
    urlSlug: `/${trackingItemId}/user/${userId}`,
    body,
  });

  expect(status).toEqual(404);
});

test('POST - should create member tracking item - (create any)', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });

  const expectedReturnData = {
    userId: globalUserId,
    trackingItemId: 1,
  };

  mockMethodAndReturn(createMemberTrackingItem, expectedReturnData);

  const { status, data } = await testNextApi.post(memberTrackingItemHandler, {
    body: memberTrackingItemBody,
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedReturnData);
});

test('POST - should create member tracking item - (create own)', async () => {
  const expectedReturnData = {
    userId: globalUserId,
    trackingItemId: 1,
  };

  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  mockMethodAndReturn(createMemberTrackingItem, expectedReturnData);

  const { status, data } = await testNextApi.post(memberTrackingItemHandler, {
    body: memberTrackingItemBody,
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedReturnData);
});
test('POST - should create member tracking item and member tracking record when flag is set to true', async () => {
  //data returned from mocked Db create method for creating tracking record
  const returnedMemberTrackingRecordDB = {
    order: 0,
    trackingItemId: 2,
    traineeId: globalUserId,
    authorityId: 'jo2jo2j3o23jo32j',
    authoritySignedDate: null,
    traineeSignedDate: null,
    completedDate: null,
  };

  //Data returned from mocked DB create method for creating a tracking item
  const memberTrackingItemPostBody = {
    userId: globalUserId,
    isActive: true,
    trackingItemId: 2,
  };

  //data returned to client
  const expectedReturnData = {
    ...memberTrackingItemPostBody,
    memberTrackingRecords: [returnedMemberTrackingRecordDB],
  };

  mockMethodAndReturn(createMemberTrackingItem, memberTrackingItemPostBody);
  mockMethodAndReturn(createMemberTrackingRecord, returnedMemberTrackingRecordDB);

  const { status, data } = await testNextApi.post(memberTrackingItemHandler, {
    body: memberTrackingItemPostBody,
    urlId: '?create_member_tracking_record=true',
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedReturnData);
});
test('POST - should return 401 if user is not authorized', async () => {
  mockMethodAndReturn(findUserByDodId, null);

  const body = {
    userId: globalUserId,
    isActive: true,
    trackingItemId: 1,
  };

  const { status, data } = await testNextApi.post(memberTrackingItemHandler, {
    body,
    urlId: '?create_member_tracking_record=true',
  });

  expect(status).toBe(401);
  expect(data).toStrictEqual({
    error: 'Not Authenticated',
    description: 'You are not authenticated',
  });
});

test('POST - should return 403 if user role is not allowed to create member tracking item', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });

  const body = {
    userId: globalUserId,
    isActive: true,
    trackingItemId: 1,
  };

  const { status, data } = await testNextApi.post(memberTrackingItemHandler, {
    body,
    urlId: '?create_member_tracking_record=true',
  });

  expect(status).toBe(403);
  expect(data).toStrictEqual({
    message: 'You do not have the appropriate permissions',
  });
});

test('PATCH - should not allow', async () => {
  const { status } = await testNextApi.patch(memberTrackingItemHandler);
  expect(status).toBe(405);
});
