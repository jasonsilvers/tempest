/*
 * @jest-environment node
 */

import { findGrants } from '../../../src/repositories/grantsRepo';
import { findMemberTrackingRecordById, updateMemberTrackingRecord } from '../../../src/repositories/memberTrackingRepo';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import memberTrackingRecordSlugHandler from '../../../src/pages/api/tempest/membertrackingrecords/[...slug]';
import dayjs from 'dayjs';
import { testNextApi } from '../../testutils/NextAPIUtils';
import MockDate from 'mockdate';
import { MemberTrackingRecord } from '@prisma/client';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/memberTrackingRepo.ts');

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

beforeAll(() => {
  const today = dayjs().toDate();
  MockDate.set(today);
});

afterAll(() => {
  MockDate.reset();
});
test('should sign trainee', async () => {
  const returnedMemberTrackingRecordDB = {
    order: 0,
    trackingItemId: 1,
    traineeId: 1,
    authorityId: null,
    authoritySignedDate: null,
    traineeSignedDate: null,
    completedDate: dayjs('2020-5-14').toDate(),
  };

  const updatedMemberTrackingRecordFromDb = {
    ...returnedMemberTrackingRecordDB,
    traineeSignedDate: dayjs().toDate(),
  };

  const expectedMTRParms = {
    completedDate: dayjs('2020-5-14').toDate(),
    traineeSignedDate: dayjs().toDate(),
  };

  mockMethodAndReturn(findMemberTrackingRecordById, returnedMemberTrackingRecordDB);
  mockMethodAndReturn(updateMemberTrackingRecord, updatedMemberTrackingRecordFromDb);

  const { status, data } = await testNextApi.post(memberTrackingRecordSlugHandler, {
    body: {},
    urlSlug: '23/sign_trainee',
  });

  expect(updateMemberTrackingRecord).toBeCalledWith(23, expectedMTRParms);
  expect(status).toBe(200);
  expect(JSON.stringify(data)).toEqual(JSON.stringify(updatedMemberTrackingRecordFromDb));
});
test('should sign authority', async () => {
  const returnedMemberTrackingRecordDB = {
    order: 0,
    trackingItemId: 1,
    traineeId: 2,
    authorityId: null,
    authoritySignedDate: null,
    traineeSignedDate: null,
    completedDate: dayjs('2020-5-14'),
  };

  const updatedMemberTrackingRecordFromDb = {
    authorityId: 1,
    authoritySignedDate: dayjs().toDate(),
    completedDate: dayjs('2020-5-14'),
  };

  const expectedMTRParms = {
    authorityId: 1,
    authoritySignedDate: dayjs().toDate(),
    completedDate: dayjs('2020-5-14'),
  };

  mockMethodAndReturn(findMemberTrackingRecordById, returnedMemberTrackingRecordDB);
  mockMethodAndReturn(updateMemberTrackingRecord, expectedMTRParms);

  const { status, data } = await testNextApi.post(memberTrackingRecordSlugHandler, {
    body: {},
    urlSlug: '23/sign_authority',
  });

  expect(updateMemberTrackingRecord).toBeCalledWith(23, expectedMTRParms);
  expect(status).toBe(200);
  expect(JSON.stringify(data)).toEqual(JSON.stringify(updatedMemberTrackingRecordFromDb));
});
test('should not sign trainee if already signed as authority', async () => {
  const returnedMemberTrackingRecordDB = {
    order: 0,
    trackingItemId: 1,
    traineeId: 1,
    authorityId: 1,
    authoritySignedDate: dayjs('2020-5-14').toDate(),
    traineeSignedDate: null,
    completedDate: dayjs('2020-5-14').toDate(),
  };

  mockMethodAndReturn(findMemberTrackingRecordById, returnedMemberTrackingRecordDB);

  const { status, data } = await testNextApi.post(memberTrackingRecordSlugHandler, {
    body: {},
    urlSlug: '23/sign_trainee',
  });

  expect(updateMemberTrackingRecord).not.toBeCalled();
  expect(status).toBe(409);
  expect(data).toStrictEqual({
    message: 'Cannot sign as both authority and trainee',
  });
});
test('should not sign authority if already signed as trainee', async () => {
  const returnedMemberTrackingRecordDB = {
    order: 0,
    trackingItemId: 1,
    traineeId: 1,
    authorityId: null,
    authoritySignedDate: null,
    traineeSignedDate: dayjs('2020-5-14').toDate(),
    completedDate: dayjs('2020-5-14').toDate(),
  };

  mockMethodAndReturn(findMemberTrackingRecordById, returnedMemberTrackingRecordDB);

  const { status, data } = await testNextApi.post(memberTrackingRecordSlugHandler, {
    body: {},
    urlSlug: '23/sign_authority',
  });

  expect(updateMemberTrackingRecord).not.toBeCalled();
  expect(status).toBe(409);
  expect(data).toStrictEqual({
    message: 'Cannot sign as both authority and trainee',
  });
});
test('should not be able to sign trainee if does not own record', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  const returnedMemberTrackingRecordDB = {
    order: 0,
    trackingItemId: 1,
    traineeId: 'c100e2fa-50d0-49a6-b10f-00adde24d0c2',
    authorityId: 2,
    authoritySignedDate: dayjs('2020-5-14').toDate(),
    traineeSignedDate: null,
    completedDate: dayjs('2020-5-14').toDate(),
  };

  mockMethodAndReturn(findMemberTrackingRecordById, returnedMemberTrackingRecordDB);

  const { status, data } = await testNextApi.post(memberTrackingRecordSlugHandler, {
    body: {},
    urlSlug: '23/sign_trainee',
  });

  expect(updateMemberTrackingRecord).not.toBeCalled();
  expect(status).toBe(403);
  expect(data).toStrictEqual({
    message: 'You do not have permission to perform this action',
  });
});
test('should not be able to sign authority without correct role', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  const returnedMemberTrackingRecordDB = {
    order: 0,
    trackingItemId: 1,
    traineeId: 1,
    authorityId: 2,
    authoritySignedDate: dayjs('2020-5-14').toDate(),
    traineeSignedDate: null,
    completedDate: dayjs('2020-5-14').toDate(),
  };

  mockMethodAndReturn(findMemberTrackingRecordById, returnedMemberTrackingRecordDB);

  const { status, data } = await testNextApi.post(memberTrackingRecordSlugHandler, {
    body: {},
    urlSlug: '23/sign_trainee',
  });

  expect(updateMemberTrackingRecord).not.toBeCalled();
  expect(status).toBe(403);
  expect(data).toStrictEqual({
    message: 'You do not have permission to perform this action',
  });
});
test('should return 400 if url is incorrect', async () => {
  const { status } = await testNextApi.post(memberTrackingRecordSlugHandler, {
    body: {},
    urlSlug: '23/doesnotexisst',
  });

  expect(status).toBe(400);
});
test('should return 404 if record is not found', async () => {
  mockMethodAndReturn(findMemberTrackingRecordById, null);

  const { status } = await testNextApi.post(memberTrackingRecordSlugHandler, {
    body: {},
    urlSlug: '23/sign_authority',
  });

  expect(updateMemberTrackingRecord).not.toBeCalled();
  expect(status).toBe(404);
});

test('Should not accept GET', async () => {
  const userId = 2;
  mockMethodAndReturn(findUserByEmail, {
    id: userId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });

  const { status } = await testNextApi.get(memberTrackingRecordSlugHandler, {
    urlSlug: '23/sign_authority',
  });

  expect(status).toEqual(405);
});

test('should handle null value for updating completed date ', async () => {
  const returnedMemberTrackingRecordDB = {
    order: 0,
    trackingItemId: 1,
    traineeId: 1,
    authorityId: null,
    authoritySignedDate: null,
    traineeSignedDate: null,
    completedDate: null,
  };

  const updatedMemberTrackingRecordFromDb = {
    ...returnedMemberTrackingRecordDB,
    completedDate: null,
  };

  const expectedMTRParms = {
    completedDate: null,
    traineeSignedDate: null,
  };

  mockMethodAndReturn(findMemberTrackingRecordById, returnedMemberTrackingRecordDB);
  mockMethodAndReturn(updateMemberTrackingRecord, updatedMemberTrackingRecordFromDb);

  const { status, data } = await testNextApi.post(memberTrackingRecordSlugHandler, {
    body: {},
    urlSlug: '23/update_completion',
  });

  expect(updateMemberTrackingRecord).toBeCalledWith(23, expectedMTRParms);
  expect(status).toBe(200);
  expect(JSON.stringify(data)).toEqual(JSON.stringify(updatedMemberTrackingRecordFromDb));
});

test('should handle update of completion date', async () => {
  const returnedMemberTrackingRecordDB = {
    order: 0,
    trackingItemId: 1,
    traineeId: 1,
    authorityId: null,
    authoritySignedDate: null,
    traineeSignedDate: null,
    completedDate: null,
  };

  const updatedMemberTrackingRecordFromDb = {
    ...returnedMemberTrackingRecordDB,
    completedDate: dayjs('2020-5-14').toDate(),
  };

  const expectedMTRParms = {
    completedDate: dayjs('2020-5-14').toDate(),
    traineeSignedDate: null,
  };

  mockMethodAndReturn(findMemberTrackingRecordById, returnedMemberTrackingRecordDB);
  mockMethodAndReturn(updateMemberTrackingRecord, updatedMemberTrackingRecordFromDb);

  const { status, data } = await testNextApi.post(memberTrackingRecordSlugHandler, {
    body: { completedDate: dayjs('2020-5-14').toDate() } as MemberTrackingRecord,
    urlSlug: '23/update_completion',
  });

  expect(updateMemberTrackingRecord).toBeCalledWith(23, expectedMTRParms);
  expect(status).toBe(200);
  expect(JSON.stringify(data)).toEqual(JSON.stringify(updatedMemberTrackingRecordFromDb));
});

test('should return 400 if complete date not correct type', async () => {
  const returnedMemberTrackingRecordDB = {
    order: 0,
    trackingItemId: 1,
    traineeId: 1,
    authorityId: null,
    authoritySignedDate: null,
    traineeSignedDate: null,
    completedDate: null,
  };

  const updatedMemberTrackingRecordFromDb = {
    ...returnedMemberTrackingRecordDB,
    completedDate: dayjs('2020-5-14').toDate(),
  };

  mockMethodAndReturn(findMemberTrackingRecordById, returnedMemberTrackingRecordDB);
  mockMethodAndReturn(updateMemberTrackingRecord, updatedMemberTrackingRecordFromDb);

  const { status } = await testNextApi.post(memberTrackingRecordSlugHandler, {
    body: { completedDate: 'daufhaiuhiu23h2' },
    urlSlug: '23/update_completion',
  });

  expect(status).toBe(400);
});

test('should return error if completed date is in future', async () => {
  const returnedMemberTrackingRecordDB = {
    order: 0,
    trackingItemId: 1,
    traineeId: 1,
    authorityId: null,
    authoritySignedDate: null,
    traineeSignedDate: null,
    completedDate: null,
  };

  mockMethodAndReturn(findMemberTrackingRecordById, returnedMemberTrackingRecordDB);

  const { status, data } = await testNextApi.post(memberTrackingRecordSlugHandler, {
    body: { completedDate: dayjs().add(5, 'days').toDate() } as MemberTrackingRecord,
    urlSlug: '23/update_completion',
  });

  expect(status).toBe(409);
  expect(JSON.stringify(data)).toEqual(JSON.stringify({ message: 'Cannot update completion date in the future' }));
});
