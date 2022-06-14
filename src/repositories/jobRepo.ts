import { JobStatus } from '@prisma/client';
import dayjs from 'dayjs';

export const createJob = (total: number, userId: number) => {
  return prisma.job.create({
    data: {
      message: `Started at ${dayjs().format('TTTT')}`,
      progress: 0,
      status: JobStatus.WORKING,
      total,
      startedById: userId,
    },
  });
};
