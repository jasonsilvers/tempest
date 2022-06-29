import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { testNextApi } from '../../testutils/NextAPIUtils';
import jobsIdApiHandler from '../../../src/pages/api/jobs/[id]';
import { findJobById } from '../../../src/repositories/jobRepo';
import { JobStatus } from '@prisma/client';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/jobRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');

const testJob = {
  id: 29,
  message: 'Started at \tTue, Jun 21, 2022 8:33 AM',
  progress: 1,
  status: JobStatus.WORKING,
  total: 1,
  url: '/api/jobs/29',
  startedById: 321,
  avgProcessingTime: null,
  results: [{ id: 1, status: JobStatus.QUEUED, success: false, message: null, jobId: 29 }],
};

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
    organizationId: 2,
  });
  mockMethodAndReturn(findGrants, [...grants]);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should return 401 if not authorized', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: 2,
  });
  const { status } = await testNextApi.get(jobsIdApiHandler, { urlId: '1', withJwt: false });

  expect(status).toBe(401);
});

test('should return 405 if not get', async () => {
  const { status } = await testNextApi.post(jobsIdApiHandler, { body: {} });

  expect(status).toBe(405);
});

test('should return 400 if id not included', async () => {
  const { status } = await testNextApi.get(jobsIdApiHandler);

  expect(status).toBe(400);
});

test('should return 404 if job not found', async () => {
  mockMethodAndReturn(findJobById, null);
  const { status } = await testNextApi.get(jobsIdApiHandler, { urlId: '1' });

  expect(status).toBe(404);
});

test('should return 403 if not allowed to read - any', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 2,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: 2,
  });
  mockMethodAndReturn(findJobById, testJob);
  const { status } = await testNextApi.get(jobsIdApiHandler, { urlId: '1' });

  expect(status).toBe(403);
});

test('should return 403 if not allowed to read - own', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 321,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: 2,
  });
  mockMethodAndReturn(findJobById, testJob);
  const { status } = await testNextApi.get(jobsIdApiHandler, { urlId: '1' });

  expect(status).toBe(403);
});

test('should return job', async () => {
  mockMethodAndReturn(findJobById, { ...testJob, startedById: 2 });
  const { status, data } = await testNextApi.get(jobsIdApiHandler, { urlId: '1' });

  expect(status).toBe(200);
  expect(data).toEqual({ ...testJob, startedById: 2 });
});
