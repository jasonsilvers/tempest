import { NextApiRequestWithAuthorization, withApiAuth } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { findUserByDodId, UserWithAll, UserWithRole } from '../../../repositories/userRepo';
import { findMemberTrackingRecordById } from '../../../repositories/memberTrackingRepo';
import { getAc, permissionDenied } from '../../../middleware/utils';
import { EResource } from '../../../types/global';

interface ITempestMemberTrackingRecordApiRequest<T, B = unknown> extends NextApiRequestWithAuthorization<T, B> {
  query: {
    id: string;
  };
}

const INCLUDE_TRACKING_ITEM = true;

async function memberTrackingRecordIdHandler(
  req: ITempestMemberTrackingRecordApiRequest<UserWithRole>,
  res: NextApiResponse
) {
  const {
    method,
    query: { id },
  } = req;

  const memberTrackingRecordId = parseInt(id);

  const ac = await getAc();

  switch (method) {
    case 'GET': {
      const memberTrackingRecord = await findMemberTrackingRecordById(memberTrackingRecordId, INCLUDE_TRACKING_ITEM);

      const permission =
        req.user.id !== memberTrackingRecord.traineeId
          ? ac.can(req.user.role.name).readAny(EResource.USER)
          : ac.can(req.user.role.name).readOwn(EResource.USER);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      res.status(200).json(memberTrackingRecord);
      break;
    }

    default:
      res.status(409).json({ message: 'Not implemented' });
      break;
  }
}

export default withApiAuth(memberTrackingRecordIdHandler, findUserByDodId);
