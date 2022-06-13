import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { ITempestApiMessage } from '../../../../const/enums';
import { MethodNotAllowedError } from '../../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../../middleware/withTempestHandlers';
import { findUserByEmail, LoggedInUser } from '../../../../repositories/userRepo';

const bulkTrackingCreateOrUpdateSchema = {
  post: {
    body: Joi.array().items(
      Joi.object({
        userId: Joi.number().required(),
        trackingItemId: Joi.number().required(),
        isActive: Joi.number().required(),
      })
    ),
  },
};

const bulkTrackingCreateOrUpdateHandler = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<ITempestApiMessage>
) => {
  const { method } = req;

  if (method !== 'POST') {
    throw new MethodNotAllowedError();
  }

  return res.status(200).json({ message: 'ok' });
};

export default withTempestHandlers(
  bulkTrackingCreateOrUpdateHandler,
  findUserByEmail,
  bulkTrackingCreateOrUpdateSchema
);
