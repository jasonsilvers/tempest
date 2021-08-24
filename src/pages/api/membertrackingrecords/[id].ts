import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import { deleteMemberTrackingRecord, findMemberTrackingRecordById } from '../../../repositories/memberTrackingRepo';
import { getAc } from '../../../middleware/utils';
import { EResource } from '../../../types/global';
import {
  MethodNotAllowedError,
  NotFoundError,
  PermissionError,
  withErrorHandlingAndAuthorization,
} from '../../../middleware/withErrorHandling';

interface ITempestMemberTrackingRecordApiRequest<T, B = unknown> extends NextApiRequestWithAuthorization<T, B> {
  query: {
    id: string;
  };
}

const INCLUDE_TRACKING_ITEM = true;

async function memberTrackingRecordIdHandler(
  req: ITempestMemberTrackingRecordApiRequest<LoggedInUser>,
  res: NextApiResponse
) {
  const {
    method,
    query: { id },
  } = req;

  const memberTrackingRecordId = parseInt(id);

  const ac = await getAc();
  const memberTrackingRecord = await findMemberTrackingRecordById(memberTrackingRecordId, INCLUDE_TRACKING_ITEM);

  if (!memberTrackingRecord) {
    throw new NotFoundError();
  }

  switch (method) {
    case 'GET': {
      const permission =
        req.user.id !== memberTrackingRecord.traineeId
          ? ac.can(req.user.role.name).readAny(EResource.MEMBER_TRACKING_RECORD)
          : ac.can(req.user.role.name).readOwn(EResource.MEMBER_TRACKING_RECORD);

      if (!permission.granted) {
        throw new PermissionError();
      }

      return res.status(200).json(memberTrackingRecord);
    }

    case 'DELETE': {
      const permission =
        req.user.id !== memberTrackingRecord.traineeId
          ? ac.can(req.user.role.name).deleteAny(EResource.MEMBER_TRACKING_RECORD)
          : ac.can(req.user.role.name).deleteOwn(EResource.MEMBER_TRACKING_RECORD);

      if (!permission.granted) {
        throw new PermissionError();
      }

      const deletedRecord = await deleteMemberTrackingRecord(memberTrackingRecordId);

      return res.status(200).json(deletedRecord);
    }

    default:
      throw new MethodNotAllowedError(method);
  }
}

export default withErrorHandlingAndAuthorization(memberTrackingRecordIdHandler, findUserByDodId);
