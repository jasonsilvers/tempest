import { Job, JobResult, JobStatus, Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import prisma from '../prisma/prisma';

export const findJobById = (jobId: number) => {
  return prisma.job.findUnique({
    where: { id: jobId },
    include: { results: { orderBy: { id: 'desc' }, include: { forUser: true, forTrackingItem: true } } },
  });
};

export const createJob = async (total: number, userId: number) => {
  return prisma.job.create({
    data: {
      message: `Started at ${dayjs().format('	ddd, MMM D, YYYY h:mm A')}`,
      progress: 0,
      status: JobStatus.WORKING,
      total,
      startedById: userId,
    },
    include: { results: true },
  });
};

export const updateJob = (jobId: number, data: Partial<Job>) => {
  return prisma.job.update({ where: { id: jobId }, data });
};

export const createJobResults = (jobId: number, count: number) => {
  const data = [];

  for (let i = 0; i < count; i++) {
    const newJobResult: Omit<JobResult, 'id'> = {
      jobId,
      status: JobStatus.QUEUED,
      success: false,
      message: null,
      forUserId: null,
      forTrackingItemId: null,
    };
    data.push(newJobResult);
  }

  return prisma.jobResult.createMany({ data });
};

export const updateJobResult = (jobResultId: number, data: Partial<JobResult>) => {
  return prisma.jobResult.update({
    where: { id: jobResultId },
    data,
  });
};

export const findJobResultsByJobId = (jobId: number) => {
  return prisma.jobResult.findMany({ where: { jobId }, include: { forTrackingItem: true, forUser: true } });
};

// required to infer the return type from the Prisma Client
export type JobWithResults = Prisma.PromiseReturnType<typeof findJobById>;
export type JobResults = Prisma.PromiseReturnType<typeof findJobResultsByJobId>;
