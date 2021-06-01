import { NextApiRequestWithAuthorization, withApiAuth } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { findUserByDodId, UserWithAll } from '../../../repositories/userRepo';
import { findMemberTrackingRecordById } from '../../../repositories/memberTrackingRepo';

interface ITempestMemberTrackingRecordApiRequest<T, B = unknown> extends NextApiRequestWithAuthorization<T, B> {
  query: {
    id: string;
  };
}

async function memberTrackingRecordIdHandler(
  req: ITempestMemberTrackingRecordApiRequest<UserWithAll>,
  res: NextApiResponse
) {
  const {
    method,
    query: { id },
  } = req;

  const memberTrackingRecordId = parseInt(id);

  switch (method) {
    case 'GET': {
      const memberTrackingRecord = await findMemberTrackingRecordById(memberTrackingRecordId, true);
      res.status(200).json(memberTrackingRecord);
      break;
    }

    default:
      res.status(409).json({ message: 'Not implemented' });
      break;
  }
}

export default withApiAuth(memberTrackingRecordIdHandler, findUserByDodId);
