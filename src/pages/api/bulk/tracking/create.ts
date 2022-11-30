import Joi from 'joi';
import { NextApiRequest, NextApiResponse } from 'next';
import { EResource, ITempestApiMessage } from '../../../../const/enums';
import { getAc } from '../../../../middleware/utils';
import { MethodNotAllowedError, PermissionError } from '../../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../../middleware/withTempestHandlers';
import { createJob, createJobResults, findJobResultsByJobId } from '../../../../repositories/jobRepo';
import { findUserByEmail, LoggedInUser } from '../../../../repositories/userRepo';
import { BulkTrackingBodyItem, trackingCreate } from '../../../../utils/bulk';

const bulkTrackingCreateSchema = {
  post: {
    body: Joi.array().items(
      Joi.object({
        userId: Joi.number().required(),
        trackingItemId: Joi.number().required(),
        isActive: Joi.boolean().required(),
      })
    ),
  },
};

interface IExtendedNextApiRequest extends NextApiRequest {
  user: LoggedInUser;
  body: BulkTrackingBodyItem[];
}

const bulkTrackingCreateHandler = async (req: IExtendedNextApiRequest, res: NextApiResponse<ITempestApiMessage>) => {
  const { method, body } = req;

  if (method !== 'POST') {
    throw new MethodNotAllowedError();
  }

  const ac = await getAc();

  const mtiPermission = ac?.can(req.user.role?.name).createAny(EResource.MEMBER_TRACKING_ITEM);
  const mtrPermission = ac?.can(req.user.role?.name).createAny(EResource.MEMBER_TRACKING_RECORD);

  //TODO: This should be an AND
  if (!mtiPermission.granted || !mtrPermission.granted) {
    throw new PermissionError();
  }

  const job = await createJob(body.length, req.user.id);
  await createJobResults(job.id, body.length);
  const jobResults = await findJobResultsByJobId(job.id);
  job.results = jobResults;
  job.url = `/api/jobs/${job.id}`;

  trackingCreate(req.user, body, job.id);

  res.status(202).json(job);
};

export default withTempestHandlers(bulkTrackingCreateHandler, findUserByEmail, bulkTrackingCreateSchema);
