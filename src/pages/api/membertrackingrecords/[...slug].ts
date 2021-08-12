import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { postMemberTrackingRecordsAction } from '../../../controllers/memberTrackingRecordsController';
import { MethodNotAllowedError, withErrorHandlingAndAuthorization } from '../../../middleware/withErrorHandling';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';

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

export default withErrorHandlingAndAuthorization(memberTrackingRecordSlugHandler, findUserByDodId);
