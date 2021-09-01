import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import {
  memberTrackingRecordPostSchema,
  postMemberTrackingRecordsAction,
} from '../../../controllers/memberTrackingRecordsController';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';

const memberTrackingRecordSchema = {
  post: memberTrackingRecordPostSchema,
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

export default withTempestHandlers(memberTrackingRecordSlugHandler, findUserByDodId, memberTrackingRecordSchema);
