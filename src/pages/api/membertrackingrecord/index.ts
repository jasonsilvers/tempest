import { MemberTrackingRecord } from '.prisma/client';
import {
  NextApiRequestWithAuthorization,
  withApiAuth,
} from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc } from '../../../middleware/utils';
import { createTrackingRecord } from '../../../repositories/memberTrackingRecordRepo';
import { findUserByDodId, UserWithRole } from '../../../repositories/userRepo';
import { EResource, ITempestApiError } from '../../../types/global';

const memberTrackingRecordHander = async (
  req: NextApiRequestWithAuthorization<UserWithRole>,
  res: NextApiResponse<MemberTrackingRecord | ITempestApiError>
) => {
  const { method, body } = req;

  const ac = await getAc();

  switch (method) {
    case 'POST': {
      const permission =
        req.user.id === req.body.traineeId
          ? ac.can(req.user.role.name).createOwn(EResource.TRACKING_RECORD)
          : ac.can(req.user.role.name).createAny(EResource.TRACKING_RECORD);

      if (!permission.granted) {
        return res.status(403).json({
          message: 'You do not have the appropriate permissions',
        });
      }

      const trackingRecord = await createTrackingRecord(body);
      res.status(200).json(trackingRecord);
      break;
    }
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
};

export default withApiAuth(memberTrackingRecordHander, findUserByDodId);
