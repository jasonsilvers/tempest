import { findGrants } from '../../../../src/repositories/grantsRepo';
import { findUserByEmail } from '../../../../src/repositories/userRepo';
import { grants } from '../../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../../testutils/mocks/repository';
import { testNextApi } from '../../../testutils/NextAPIUtils';
import bulkTrackingCreateHandler from '../../../../src/pages/api/tempest/bulk/tracking/create';
import { createJob, createJobResults, findJobResultsByJobId } from '../../../../src/repositories/jobRepo';
import { trackingCreate } from '../../../../src/utils/bulk';

jest.mock('../../../../src/repositories/userRepo.ts');
jest.mock('../../../../src/repositories/grantsRepo.ts');
jest.mock('../../../../src/repositories/jobRepo.ts');
jest.mock('../../../../src/utils/bulk.ts');

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

test('should return 401 if not authorized', async () => {
  const { status } = await testNextApi.post(bulkTrackingCreateHandler, { withJwt: false, body: {} });

  expect(status).toBe(401);
});

test('should return 400 if body is not an array', async () => {
  const { status } = await testNextApi.post(bulkTrackingCreateHandler, { body: {} });

  expect(status).toBe(400);
});

test('should return 403 if incorrect permissions', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 1,
    firstName: 'joe',
    role: { id: '11', name: 'member' },
  });

  const { status } = await testNextApi.post(bulkTrackingCreateHandler, {
    body: [],
  });

  expect(status).toBe(403);
});

test('should return 405 if not a post', async () => {
  const { status } = await testNextApi.get(bulkTrackingCreateHandler, {});

  expect(status).toBe(405);
});

test('should return 202 if successful', async () => {
  mockMethodAndReturn(createJob, {});
  mockMethodAndReturn(createJobResults, {});
  mockMethodAndReturn(findJobResultsByJobId, {});
  const trackingCreateSpy = mockMethodAndReturn(trackingCreate, {});

  const { status } = await testNextApi.post(bulkTrackingCreateHandler, {
    body: [],
  });

  expect(trackingCreateSpy).toBeCalled();

  expect(status).toBe(202);
});
