import {
  NextApiRequestWithAuthorization,
  withApiAuth,
} from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { findUserByDodId, UserWithAll } from '../../../repositories/userRepo';

async function memberTrackingRecordIdHandler(
  req: NextApiRequestWithAuthorization<UserWithAll>,
  res: NextApiResponse
) {
  res.status(409).json({ message: 'Not implemented' });
}

export default withApiAuth(memberTrackingRecordIdHandler, findUserByDodId);
