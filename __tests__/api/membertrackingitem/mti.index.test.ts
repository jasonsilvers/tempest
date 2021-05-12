import { grants } from '../../utils/mocks/fixtures';
import { mockMethodAndReturn } from '../../utils/mocks/repository';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import {
  createMemberTrackingItem,
  createTrackingRecord,
} from '../../../src/repositories/memberTrackingRepo';
import testNextApi from '../../utils/NextAPIUtils';
import memberTrackingItemHandler from '../../../src/pages/api/membertrackingitem';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/memberTrackingRepo.ts');

//INPUT for POST MTR

const userId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

const memberTrackingRecordBody = {
  userId,
  trackingItemId: 1,
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

test('POST - should create member tracking item', async () => {
  const expectedReturnData = {
    userId,
    trackingItemId: 1,
  };

  mockMethodAndReturn(createMemberTrackingItem, expectedReturnData);

  const { status, data } = await testNextApi.post(memberTrackingItemHandler, {
    body: memberTrackingRecordBody,
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedReturnData);
});
test('POST - should create member tracking item and member tracking record when flag is set to true', async () => {
  //data returned from mocked Db create method for creating tracking record
  const returnedMemberTrackingRecordDB = {
    order: 0,
    trackingItemId: 1,
    traineeId: userId,
    authorityId: 'jo2jo2j3o23jo32j',
    authoritySignedDate: null,
    traineeSignedDate: null,
    completedDate: null,
  };

  //Data returned from mocked DB create method for creating a tracking item
  const returnedMemberTrackingItem = {
    userId,
    trackingItemId: 1,
  };

  //data returned to client
  const expectedReturnData = {
    ...returnedMemberTrackingItem,
    memberTrackingRecords: [returnedMemberTrackingRecordDB],
  };

  mockMethodAndReturn(createMemberTrackingItem, returnedMemberTrackingItem);
  mockMethodAndReturn(createTrackingRecord, returnedMemberTrackingRecordDB);

  const { status, data } = await testNextApi.post(memberTrackingItemHandler, {
    body: returnedMemberTrackingItem,
    urlId: '?create_member_tracking_record=true',
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedReturnData);
});
test('POST - should return 401 if user is not authorized', async () => {
  mockMethodAndReturn(findUserByDodId, null);

  const body = {
    userId,
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
    userId,
    trackingItemId: 1,
  };

  const { status, data } = await testNextApi.post(memberTrackingItemHandler, {
    body,
    urlId: '?create_member_tracking_record=true',
  });

  expect(status).toBe(403);
  expect(data).toStrictEqual({
    message: 'You do not have the correct permissions',
  });
});

test('Should not accept GET', async () => {
  const traineeId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

  mockMethodAndReturn(findUserByDodId, {
    id: traineeId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);

  const { status } = await testNextApi.get(memberTrackingItemHandler);

  expect(status).toEqual(405);
});

test('Should not accept DELETE', async () => {
  const traineeId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

  mockMethodAndReturn(findUserByDodId, {
    id: traineeId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);

  const { status } = await testNextApi.delete(memberTrackingItemHandler);

  expect(status).toEqual(405);
});

test('Should not accept PUT', async () => {
  const traineeId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

  mockMethodAndReturn(findUserByDodId, {
    id: traineeId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);

  const { status } = await testNextApi.put(memberTrackingItemHandler, {
    body: {},
  });

  expect(status).toEqual(405);
});
