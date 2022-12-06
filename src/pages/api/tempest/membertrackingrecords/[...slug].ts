import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { postMemberTrackingRecordsAction } from '../../../../controllers/memberTrackingRecordsController';
import { MethodNotAllowedError } from '../../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../../middleware/withTempestHandlers';
import { findUserByEmail, LoggedInUser } from '../../../../repositories/userRepo';

const memberTrackingRecordSlugPostSchema = {
  body: Joi.object({
    completedDate: Joi.date().optional(),
  }),
  query: Joi.object({
    slug: Joi.required(),
    id: Joi.optional(),
  }),
};

const memberTrackingRecordSlugSchema = {
  post: memberTrackingRecordSlugPostSchema,
};

async function memberTrackingRecordSlugHandler(
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse
) {
  const { method } = req;

  if (method !== 'POST') {
    throw new MethodNotAllowedError(method);
  }

  return postMemberTrackingRecordsAction(req, res);
}

export default withTempestHandlers(memberTrackingRecordSlugHandler, findUserByEmail, memberTrackingRecordSlugSchema);
