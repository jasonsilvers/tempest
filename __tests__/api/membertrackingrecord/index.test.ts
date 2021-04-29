import memberTrackingRecordHandler from '../../../src/pages/api/membertrackingrecord';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { createTrackingRecord } from '../../../src/repositories/memberTrackingRecordRepo';
import { grants } from '../../utils/mocks/fixtures';
import mockMethod from '../../utils/mocks/repository';
import testNextApi from '../../utils/NextAPIUtils';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/memberTrackingRecordRepo.ts');

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

test('Monitor should be able to create new member tracking record', async () => {
  const authorityId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

  mockMethod(findUserByDodId, {
    id: authorityId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);
  const trackingRecord = {
    id: 1,
    traineeSignedDate: null,
    authoritySignedDate: null,
    authorityId,
    traineeId: null,
    completedDate: null,
    successorId: null,
    trackingItemId: 1,
  };
  mockMethod(createTrackingRecord, trackingRecord);

  const { status, data } = await testNextApi.post(memberTrackingRecordHandler, {
    body: trackingRecord,
  });

  expect(status).toEqual(200);
  expect(data).toStrictEqual(trackingRecord);
});
test('member should be able to create new member tracking record', async () => {
  const traineeId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

  mockMethod(findUserByDodId, {
    firstName: 'joe',
    id: traineeId,
    role: { id: '22', name: 'member' },
  });
  mockMethod(findGrants, grants);

  const trackingRecord = {
    id: 1,
    traineeSignedDate: null,
    authoritySignedDate: null,
    authorityId: null,
    traineeId,
    completedDate: null,
    successorId: null,
    trackingItemId: 1,
  };
  mockMethod(createTrackingRecord, trackingRecord);

  const { status, data } = await testNextApi.post(memberTrackingRecordHandler, {
    body: trackingRecord,
  });

  expect(status).toEqual(200);
  expect(data).toStrictEqual(trackingRecord);
});

test('member should not be able to create new member tracking record for others', async () => {
  const traineeId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

  mockMethod(findUserByDodId, {
    id: traineeId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethod(findGrants, grants);

  const trackingRecord = {
    id: 1,
    traineeSignedDate: null,
    authoritySignedDate: null,
    authorityId: traineeId,
    traineeId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    completedDate: null,
    successorId: null,
    trackingItemId: 1,
  };
  mockMethod(createTrackingRecord, trackingRecord);

  const { status, data } = await testNextApi.post(memberTrackingRecordHandler, {
    body: trackingRecord,
  });

  expect(status).toEqual(403);
  expect(data).toStrictEqual({
    message: 'You do not have the appropriate permissions',
  });
});
test('Should not be able to create member tracking record with incorrect permissions', async () => {
  const traineeId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

  mockMethod(findUserByDodId, {
    id: traineeId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethod(findGrants, grants);

  const trackingRecord = {
    id: 1,
    traineeSignedDate: null,
    authoritySignedDate: null,
    authorityId: traineeId,
    traineeId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    completedDate: null,
    successorId: null,
    trackingItemId: 1,
  };
  mockMethod(createTrackingRecord, trackingRecord);

  const { status, data } = await testNextApi.post(memberTrackingRecordHandler, {
    body: trackingRecord,
  });

  expect(status).toEqual(403);
  expect(data).toStrictEqual({
    message: 'You do not have the appropriate permissions',
  });
});

test('Should not accept GET', async () => {
  const traineeId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

  mockMethod(findUserByDodId, {
    id: traineeId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethod(findGrants, grants);

  const { status } = await testNextApi.get(memberTrackingRecordHandler);

  expect(status).toEqual(405);
});

test('Should not accept DELETE', async () => {
  const traineeId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

  mockMethod(findUserByDodId, {
    id: traineeId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethod(findGrants, grants);

  const { status } = await testNextApi.delete(memberTrackingRecordHandler);

  expect(status).toEqual(405);
});

test('Should not accept PUT', async () => {
  const traineeId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

  mockMethod(findUserByDodId, {
    id: traineeId,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethod(findGrants, grants);

  const { status } = await testNextApi.put(memberTrackingRecordHandler, {
    body: {},
  });

  expect(status).toEqual(405);
});
