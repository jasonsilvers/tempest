import { MemberTrackingRecord } from '.prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { memberTrackingRecordPostSchema } from '../../../controllers/memberTrackingRecordsController';
import { getAc } from '../../../middleware/utils';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { createMemberTrackingRecord } from '../../../repositories/memberTrackingRepo';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';
import { EResource } from '../../../const/enums';

const memberTrackingRecordSchema = {
  post: memberTrackingRecordPostSchema,
};

async function memberTrackingRecordIndexHandler(
  req: NextApiRequestWithAuthorization<LoggedInUser, MemberTrackingRecord>,
  res: NextApiResponse
) {
  const { body, method } = req;

  if (method !== 'POST') {
    throw new MethodNotAllowedError(method);
  }

  const ac = await getAc();

  const permission =
    req.user.id !== body.traineeId
      ? ac.can(req.user.role.name).createAny(EResource.MEMBER_TRACKING_RECORD)
      : ac.can(req.user.role.name).createOwn(EResource.MEMBER_TRACKING_RECORD);

  if (!permission.granted) {
    throw new PermissionError();
  }

  const newMemberTrackingRecord = await createMemberTrackingRecord(body);
  return res.status(200).json(newMemberTrackingRecord);
}

export default withTempestHandlers(memberTrackingRecordIndexHandler, findUserByEmail, memberTrackingRecordSchema);
