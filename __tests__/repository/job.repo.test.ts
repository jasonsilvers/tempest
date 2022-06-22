import prisma from '../setup/mockedPrisma';
import { JobStatus } from '@prisma/client';
import {
  createJob,
  createJobResults,
  findJobById,
  findJobResultsByJobId,
  updateJob,
  updateJobResult,
} from '../../src/repositories/jobRepo';

const jobResult = {
  id: 1,
  status: JobStatus.FAILED,
  success: false,
  message: 'Requesting user did not return any users',
};

const testJob = {
  id: 29,
  message: 'Started at \tTue, Jun 21, 2022 8:33 AM',
  progress: 1,
  status: JobStatus.WORKING,
  total: 1,
  url: '/api/jobs/29',
  startedById: 321,
  avgProcessingTime: null,
  results: [jobResult],
};

test('should findJobById', async () => {
  prisma.job.findUnique.mockImplementationOnce(() => testJob);
  const job = await findJobById(29);
  expect(job).toEqual(testJob);
});

test('should createJob', async () => {
  prisma.job.create.mockImplementationOnce(() => testJob);
  const job = await createJob(2, 2);
  expect(job).toEqual(testJob);
});

test('should updateJob', async () => {
  prisma.job.update.mockImplementationOnce(() => ({ ...testJob, status: JobStatus.COMPLETED }));
  const job = await updateJob(2, { ...testJob, status: JobStatus.COMPLETED });
  expect(job).toEqual({ ...testJob, status: JobStatus.COMPLETED });
});

test('should createJobResults', async () => {
  prisma.jobResult.createMany.mockImplementationOnce(() => [jobResult]);
  await createJobResults(2, 2);
  expect(prisma.jobResult.createMany).toBeCalledWith({
    data: [
      { jobId: 2, message: null, status: JobStatus.QUEUED, success: false },
      { jobId: 2, message: null, status: JobStatus.QUEUED, success: false },
    ],
  });
});

test('should updateJobResult', async () => {
  prisma.jobResult.update.mockImplementationOnce(() => ({ ...jobResult, status: JobStatus.COMPLETED }));
  const jobResultReturned = await updateJobResult(1, { ...jobResult, status: JobStatus.COMPLETED });
  expect(jobResultReturned).toEqual({ ...jobResult, status: JobStatus.COMPLETED });
});

test('should findJobResultsByJobId', async () => {
  prisma.jobResult.findMany.mockImplementationOnce(() => ({ ...jobResult, status: JobStatus.COMPLETED }));
  const jobResultReturned = await findJobResultsByJobId(1);
  expect(jobResultReturned).toEqual({ ...jobResult, status: JobStatus.COMPLETED });
});
