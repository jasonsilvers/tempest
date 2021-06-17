import { NextApiRequestWithAuthorization, withApiAuth } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { postMemberTrackingRecordsAction } from '../../../controllers/memberTrackingRecordsController';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';

async function memberTrackingRecordSlugHandler(
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse
) {
  const { method } = req;

  if (method === 'POST') {
    return postMemberTrackingRecordsAction(req, res);
  }

  return res.status(405).json({ message: `Method ${method} Not Allowed` });
}

export default withApiAuth(memberTrackingRecordSlugHandler, findUserByDodId);
