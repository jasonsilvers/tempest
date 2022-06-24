import { Job } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { EResource } from '../../../const/enums';
import { getAc } from '../../../middleware/utils';
import {
  BadRequestError,
  MethodNotAllowedError,
  NotFoundError,
  PermissionError,
} from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { findJobById } from '../../../repositories/jobRepo';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';

export interface ITempestJobsApiRequest<T, B = unknown> extends NextApiRequestWithAuthorization<T, B> {
  query: {
    id?: string;
  };
}

const jobsHandler = async (req: ITempestJobsApiRequest<LoggedInUser>, res: NextApiResponse<Job>) => {
  const {
    method,
    query: { id },
  } = req;

  if (method !== 'GET') {
    throw new MethodNotAllowedError(method);
  }

  if (!id) {
    throw new BadRequestError();
  }

  const jobIdParam = parseInt(id);
  const job = await findJobById(jobIdParam);

  if (!job) {
    throw new NotFoundError();
  }

  const ac = await getAc();

  const permission =
    req.user.id !== job.startedById
      ? ac.can(req.user.role.name).readAny(EResource.JOB)
      : ac.can(req.user.role.name).readOwn(EResource.JOB);

  if (!permission.granted) {
    throw new PermissionError();
  }

  // const testJob = {
  //   id: 29,
  //   message: 'Started at \tTue, Jun 21, 2022 8:33 AM',
  //   progress: 1,
  //   status: JobStatus.COMPLETED,
  //   total: 1,
  //   url: '/api/jobs/29',
  //   startedById: 321,
  //   avgProcessingTime: null,
  //   results: [
  //     {
  //       id: 1,
  //       status: JobStatus.FAILED,
  //       success: false,
  //       message: 'This has failed',
  //       jobId: 29,
  //       forUserId: 1,
  //       forUser: { firstName: 'Joe', lastName: 'Admin', id: 1 },
  //       forTrackingItemId: 2,
  //       forTrackingItem: {
  //         id: 2,
  //         title: 'Fire Extinguisher',
  //         description: 'This is a test item',
  //         interval: 365,
  //       },
  //     },
  //     {
  //       id: 2,
  //       status: JobStatus.FAILED,
  //       success: false,
  //       message: 'This has failed',
  //       jobId: 29,
  //       forUserId: 1,
  //       forUser: { firstName: 'Joe', lastName: 'Admin', id: 1 },
  //       forTrackingItemId: 3,
  //       forTrackingItem: {
  //         id: 3,
  //         title: 'Fire Test',
  //         description: 'This is a test item',
  //         interval: 365,
  //       },
  //     },
  //     {
  //       id: 2,
  //       status: JobStatus.FAILED,
  //       success: false,
  //       message: 'This has failed',
  //       jobId: 29,
  //       forUserId: 3,
  //       forUser: { firstName: 'Bob', lastName: 'Sanders', id: 3 },
  //       forTrackingItemId: 3,
  //       forTrackingItem: {
  //         id: 3,
  //         title: 'Fire Test',
  //         description: 'This is a test item',
  //         interval: 365,
  //       },
  //     },
  //   ],
  // };

  res.status(200).json(job);
};

export default withTempestHandlers(jobsHandler, findUserByEmail);
