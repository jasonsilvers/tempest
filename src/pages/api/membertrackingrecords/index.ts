import { MemberTrackingRecord } from '.prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { memberTrackingRecordPostSchema } from '../../../controllers/memberTrackingRecordsController';
import { getAc, permissionDenied } from '../../../middleware/utils';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { createMemberTrackingRecord } from '../../../repositories/memberTrackingRepo';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import { EResource } from '../../../types/global';

const memberTrackingRecordSchema = {
  post: memberTrackingRecordPostSchema,
};

async function memberTrackingRecordIndexHandler(
  req: NextApiRequestWithAuthorization<LoggedInUser, MemberTrackingRecord>,
  res: NextApiResponse
) {
  const { body, method } = req;

  const ac = await getAc();

  switch (method) {
    case 'POST': {
      const permission =
        req.user.id !== body.traineeId
          ? ac.can(req.user.role.name).createAny(EResource.MEMBER_TRACKING_RECORD)
          : ac.can(req.user.role.name).createOwn(EResource.MEMBER_TRACKING_RECORD);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      const newMemberTrackingRecord = await createMemberTrackingRecord(body);
      return res.status(200).json(newMemberTrackingRecord);
    }
    default:
      throw new MethodNotAllowedError(method);
  }
}

export default withTempestHandlers(memberTrackingRecordIndexHandler, findUserByDodId, memberTrackingRecordSchema);
