import { grants } from '../../utils/mocks/fixtures';
import mockMethod from '../../utils/mocks/repository';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import {
  createTrackingItem,
  createTrackingRecord,
} from '../../../src/repositories/memberTrackingRepo';
import testNextApi from '../../utils/NextAPIUtils';
import memberTrackingItemHandler from '../../../src/pages/api/membertrackingitem';
import dayjs from 'dayjs';

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

test('POST - should create member tracking item', async () => {
  const expectedReturnData = {
    userId,
    trackingItemId: 1,
  };

  mockMethod(createTrackingItem, expectedReturnData);

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

  mockMethod(createTrackingItem, returnedMemberTrackingItem);
  mockMethod(createTrackingRecord, returnedMemberTrackingRecordDB);

  const { status, data } = await testNextApi.post(memberTrackingItemHandler, {
    body: returnedMemberTrackingItem,
    urlId: '?create_member_tracking_record=true',
  });

  //api/mti/23423?include=member_tracking_records&include=tracking_items

  expect(status).toBe(200);
  expect(data).toStrictEqual(expectedReturnData);

  //useMemberTrackingItem
  //useTrackingItem
  //useMemberTrackingRecord - authorityMemberRecords, traineeMemberRecords
  //useMemberTrackingRecordMutation
  //---invalidate useUserTracker
  //useUser
  //useUserTracker -- trackingItems, authorityMemberRecords, traineeMemberRecords
  ///----profile page would subscribe to this data
});
test('POST - should return 401 if user is not authorized', async () => {});

test('POST - should return 403 if user role is not allowed to create member tracking item', async () => {});
