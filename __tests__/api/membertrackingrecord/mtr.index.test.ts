import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { grants } from '../../utils/mocks/fixtures';
import { mockMethodAndReturn } from '../../utils/mocks/repository';
import memberTrackingRecordIndexHandler from '../../../src/pages/api/membertrackingrecord/index';
import testNextApi from '../../utils/NextAPIUtils';
import dayjs from 'dayjs';
import { createMemberTrackingRecord } from '../../../src/repositories/memberTrackingRepo';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/memberTrackingRepo.ts');

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

test('should return 401 if not Authorized', async () => {
  const { status } = await testNextApi.post(memberTrackingRecordIndexHandler, {
    withJwt: false,
    body: {},
  });

  expect(status).toBe(401);
});
test('POST - should create member tracking record', async () => {
  const returnedMemberTrackingRecordDB = {
    trackingItemId: 1,
    traineeId: 'b100e2fa-50d0-49a6-b10f-00adde24d0c2',
    authorityId: null,
    authoritySignedDate: null,
    traineeSignedDate: null,
    completedDate: dayjs('2020-5-14').toISOString(),
  };

  mockMethodAndReturn(
    createMemberTrackingRecord,
    returnedMemberTrackingRecordDB
  );

  const { status, data } = await testNextApi.post(
    memberTrackingRecordIndexHandler,
    {
      body: returnedMemberTrackingRecordDB,
    }
  );

  expect(status).toBe(200);
  expect(data).toStrictEqual(returnedMemberTrackingRecordDB);
});
test('POST - should return 403 if incorrect permissions', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });

  const { status } = await testNextApi.post(memberTrackingRecordIndexHandler, {
    body: {},
  });

  expect(status).toBe(403);
});

test('POST - should return 403 if member does not own record', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });

  const { status } = await testNextApi.post(memberTrackingRecordIndexHandler, {
    body: {},
  });

  expect(status).toBe(403);
});
