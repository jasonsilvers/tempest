import memberTrackingRecordHandler from '../../../src/pages/api/user/[...slug]';
import { findGrants } from '../../../src/repositories/grantsRepo';
import {
  findTrackingRecordsByTraineeId,
  findTrackingRecordsByAuthorityId,
  findUserByDodId,
} from '../../../src/repositories/userRepo';
import mockMethod from '../.././utils/mocks/repository';
import { grants } from '../../utils/mocks/fixtures';
import testNextApi from '../../utils/NextAPIUtils';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');

beforeEach(() => {
  jest.resetAllMocks();
});

test('should return 200 and member tracking records for trainee', async () => {
  const traineeId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  mockMethod(findUserByDodId, {
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  mockMethod(findGrants, grants);
  mockMethod(findTrackingRecordsByTraineeId, [
    {
      id: 1,
      traineeSignedDate: null,
      authoritySignedDate: null,
      authorityId: null,
      traineeId,
      completedDate: null,
      successorId: null,
      trackingItemId: 1,
    },
  ]);
  const { data, status } = await testNextApi.get(memberTrackingRecordHandler, {
    urlSlug: `${traineeId}/traineerecords`,
  });
  expect(findTrackingRecordsByTraineeId).toBeCalledWith(traineeId, true);
  expect(status).toBe(200);
  expect(data).toStrictEqual([
    {
      id: 1,
      traineeSignedDate: null,
      authoritySignedDate: null,
      authorityId: null,
      traineeId,
      completedDate: null,
      successorId: null,
      trackingItemId: 1,
    },
  ]);
});

test('should return 200 and member tracking records for authority', async () => {
  const authorityId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  mockMethod(findUserByDodId, {
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  mockMethod(findGrants, grants);
  mockMethod(findTrackingRecordsByAuthorityId, [
    {
      id: 1,
      traineeSignedDate: null,
      authoritySignedDate: null,
      traineeId: null,
      authorityId,
      completedDate: null,
      successorId: null,
      trackingItemId: 1,
    },
  ]);
  const { data, status } = await testNextApi.get(memberTrackingRecordHandler, {
    urlSlug: `${authorityId}/authorityrecords`,
  });
  expect(findTrackingRecordsByAuthorityId).toBeCalledWith(authorityId, true);
  expect(status).toBe(200);
  expect(data).toStrictEqual([
    {
      id: 1,
      traineeSignedDate: null,
      authoritySignedDate: null,
      authorityId,
      traineeId: null,
      completedDate: null,
      successorId: null,
      trackingItemId: 1,
    },
  ]);
});

test('should return 404 if bad url', async () => {
  const authorityId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  mockMethod(findUserByDodId, {
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const { data, status } = await testNextApi.get(memberTrackingRecordHandler, {
    urlSlug: `${authorityId}/authoityrecords`,
  });
  expect(status).toBe(404);
  expect(data).toStrictEqual({
    message: 'Resource Not Found',
  });
});

test('should return 404 if url has more than two slugs', async () => {
  const authorityId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  mockMethod(findUserByDodId, {
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const { data, status } = await testNextApi.get(memberTrackingRecordHandler, {
    urlSlug: `${authorityId}/authoityrecords/test`,
  });
  expect(status).toBe(404);
  expect(data).toStrictEqual({
    message: 'Resource Not Found',
  });
});

test('should return 403 if incorrect permissions', async () => {
  const authorityId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  mockMethod(findUserByDodId, {
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  mockMethod(findGrants, grants);

  const { data, status } = await testNextApi.get(memberTrackingRecordHandler, {
    urlSlug: `${authorityId}/authorityrecords`,
  });
  expect(status).toBe(403);
  expect(data).toStrictEqual({
    message: 'You do not have the appropriate permissions',
  });
});

test('should return 405 for HTTP Post', async () => {
  const authorityId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  mockMethod(findUserByDodId, {
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const { status } = await testNextApi.post(memberTrackingRecordHandler, {
    urlSlug: `${authorityId}/authorityrecords`,
    body: {},
  });
  expect(status).toBe(405);
});

test('should return 405 for HTTP Put', async () => {
  const authorityId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  mockMethod(findUserByDodId, {
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const { status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlSlug: `${authorityId}/authorityrecords`,
    body: {},
  });
  expect(status).toBe(405);
});

test('should return 405 for HTTP DELETE', async () => {
  const authorityId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
  mockMethod(findUserByDodId, {
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const { status } = await testNextApi.delete(memberTrackingRecordHandler, {
    urlSlug: `${authorityId}/authorityrecords`,
  });
  expect(status).toBe(405);
});
