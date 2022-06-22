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

  res.status(200).json(job);
};

export default withTempestHandlers(jobsHandler, findUserByEmail);
