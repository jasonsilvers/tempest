import memberTrackingRecordHandler from '../../../src/pages/api/membertrackingrecord/[id]';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import {
  updateMemberTrackingRecord,
  deleteMemberTrackingRecord,
  findMemberTrackingRecordById,
} from '../../../src/repositories/memberTrackingRecordRepo';
import mockMethod from '../../utils/mocks/repository';
import { grants } from '../../utils/mocks/fixtures';
import testNextApi from '../../utils/NextAPIUtils';
import dayjs from 'dayjs';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/memberTrackingRecordRepo.ts');

export const traineeMemberTrackingRecordWithAuthorityId = {
  id: 2,
  traineeSignedDate: null,
  authoritySignedDate: null,
  authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  traineeId: null,
  completedDate: null,
  successorId: null,
  trackingItemId: 2,
};

export const traineeAndAuthoritySignedTrackingRecord = {
  id: 2,
  traineeSignedDate: dayjs('04-20-2021').toISOString(),
  authoritySignedDate: dayjs('04-20-2021').toISOString(),
  authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  traineeId: null,
  completedDate: null,
  successorId: null,
  trackingItemId: 2,
};

test('should return 401 if no User', async () => {
  const { status, data } = await testNextApi.get(memberTrackingRecordHandler, {
    withJwt: false,
  });

  const errorMessage = {
    error: 'Not Authenticated',
    description: 'You are not authenticated',
  };

  expect(status).toBe(401);
  expect(data).toStrictEqual(errorMessage);
});

test('should return 403 if user does not have correct permission', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  mockMethod(findGrants, grants);

  const { data, status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    body: {
      id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    },
  });

  expect(status).toBe(403);
  expect(data).toStrictEqual({
    message: 'You do not have the appropriate permissions',
  });
});

test('should return 400 if no id in body', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const { data, status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    body: {
      id: null,
    },
  });

  expect(status).toBe(400);
  expect(data).toStrictEqual({
    message: 'Body does not include an memberTracking Id',
  });
});

test('should return 403 if user tries to sign as both authority and trainee', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const body = {
    id: 2,
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    completedDate: null,
    successorId: null,
    trackingItemId: 2,
  };

  const { data, status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    body,
  });

  expect(status).toBe(403);
  expect(data).toStrictEqual({
    message: 'You are not able to sign both signature blocks',
  });
});

test('should return 404 if user tries to sign someone elses record as monitor', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const body = {
    id: 2,
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    completedDate: null,
    successorId: null,
    trackingItemId: 2,
  };

  const { data, status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    body,
  });

  expect(status).toBe(400);
  expect(data).toStrictEqual({
    message: 'Unable to update records',
  });
});

test('should return 404 if user tries to sign someone elses record as member', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethod(findGrants, grants);

  const body = {
    id: 2,
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    completedDate: null,
    successorId: null,
    trackingItemId: 2,
  };

  const { data, status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    body,
  });

  expect(status).toBe(400);
  expect(data).toStrictEqual({
    message: 'Unable to update records',
  });
});

test('member can update only trainee signature on membertrackingrecord', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const expectedFilteredRecord = {
    traineeSignedDate: null,
    traineeId: null,
  };

  const expectedReturnedData = {
    id: expectedUrlId,
    traineeSignedDate: null,
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
    completedDate: null,
    successorId: null,
    trackingItemId: 2,
  };

  const body = {
    id: 2,
    traineeSignedDate: null,
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
    completedDate: null,
    successorId: null,
    trackingItemId: 2,
  };

  mockMethod(updateMemberTrackingRecord, expectedReturnedData);

  const { data, status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
    body,
  });

  expect(updateMemberTrackingRecord).toBeCalledWith(
    expectedUrlId,
    expectedFilteredRecord
  );

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedReturnedData);
});

test('monitor can update membertrackingrecord', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const expectedReturnedData = {
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
  };

  const body = {
    id: 2,
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
    completedDate: null,
    successorId: null,
    trackingItemId: 2,
  };

  mockMethod(updateMemberTrackingRecord, expectedReturnedData);

  const { data, status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
    body,
  });

  expect(updateMemberTrackingRecord).toBeCalledWith(
    expectedUrlId,
    expectedReturnedData
  );

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedReturnedData);
});

test('should return 404 if membertrackingrecord is not in database', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const body = {
    id: 2,
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
    completedDate: null,
    successorId: null,
    trackingItemId: 2,
  };

  const error = async () => {
    throw new Error('There was an error');
  };

  (updateMemberTrackingRecord as any).mockImplementation(error);

  const { data, status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
    body,
  });

  expect(status).toBe(404);
});

test('monitor can delete membertrackingrecord', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const expectedReturnedData = {
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
  };
  const returnedFromDBMemberTrackingRecord = {
    id: 2,
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
    completedDate: null,
    successorId: null,
    trackingItemId: 2,
  };

  mockMethod(findMemberTrackingRecordById, returnedFromDBMemberTrackingRecord);

  mockMethod(deleteMemberTrackingRecord, expectedReturnedData);

  const { status } = await testNextApi.delete(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
  });

  expect(deleteMemberTrackingRecord).toBeCalledWith(expectedUrlId);

  expect(status).toBe(200);
});

test('member can delete membertrackingrecord if authority is not signed', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const expectedReturnedData = {
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
  };

  const returnedFromDBMemberTrackingRecord = {
    id: 2,
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: null,
    authorityId: null,
    traineeId: null,
    completedDate: null,
    successorId: null,
    trackingItemId: 2,
  };

  mockMethod(findMemberTrackingRecordById, returnedFromDBMemberTrackingRecord);
  mockMethod(deleteMemberTrackingRecord, expectedReturnedData);

  const { status } = await testNextApi.delete(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
  });

  expect(deleteMemberTrackingRecord).toBeCalledWith(expectedUrlId);

  expect(status).toBe(200);
});

test('member cant delete membertrackingrecord if authority is signed', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const expectedReturnedData = {
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
  };

  const returnedFromDBMemberTrackingRecord = {
    id: 2,
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
    completedDate: null,
    successorId: null,
    trackingItemId: 2,
  };

  mockMethod(findMemberTrackingRecordById, returnedFromDBMemberTrackingRecord);
  mockMethod(deleteMemberTrackingRecord, expectedReturnedData);

  const { status, data } = await testNextApi.delete(
    memberTrackingRecordHandler,
    {
      urlId: expectedUrlId,
    }
  );

  expect(status).toBe(403);
  expect(data).toStrictEqual({
    message: 'Unable to delete record',
  });
});

test('DELETE - should return 404 if membertrackingrecord is not in database', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const body = {
    id: 2,
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
    completedDate: null,
    successorId: null,
    trackingItemId: 2,
  };

  mockMethod(findMemberTrackingRecordById, null);

  const error = async () => {
    throw new Error('There was an error');
  };

  (deleteMemberTrackingRecord as any).mockImplementation(error);

  const { data, status } = await testNextApi.delete(
    memberTrackingRecordHandler,
    {
      urlId: expectedUrlId,
    }
  );

  expect(status).toBe(404);
});

test('DELETE - should return 403 if role is not allowed to delete', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const { status } = await testNextApi.delete(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
  });

  expect(status).toBe(403);
});

test('POST - should not allow', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const { status } = await testNextApi.post(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
    body: {},
  });

  expect(status).toBe(405);
});

test('GET - should not allow', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const { status } = await testNextApi.get(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
  });

  expect(status).toBe(405);
});
