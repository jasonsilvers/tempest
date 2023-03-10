import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { findUserByEmail, findUserById, LoggedInUser } from '../../../../repositories/userRepo';
import {
  countMemberTrackingRecordsForMemberTrackingItem,
  deleteMemberTrackingItem,
  deleteMemberTrackingRecord,
  findMemberTrackingRecordById,
} from '../../../../repositories/memberTrackingRepo';
import { getAc } from '../../../../middleware/utils';
import { EResource } from '../../../../const/enums';
import { MethodNotAllowedError, NotFoundError, PermissionError } from '../../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../../middleware/withTempestHandlers';
import { loggedInUserHasPermissionOnUser } from '../../../../utils/userHasPermissionWithinOrg';

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

  const userFromBody = await findUserById(memberTrackingRecord.memberTrackingItem.user.id);

  if (!(await loggedInUserHasPermissionOnUser(req.user, userFromBody))) {
    throw new PermissionError();
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

      const memberTrackingRecordCount = await countMemberTrackingRecordsForMemberTrackingItem(
        memberTrackingRecord.trackingItemId,
        memberTrackingRecord.traineeId
      );

      if (memberTrackingRecordCount._count.trackingItemId === 0) {
        await deleteMemberTrackingItem(memberTrackingRecord.trackingItemId, memberTrackingRecord.traineeId);
      }

      return res.status(200).json(deletedRecord);
    }

    default:
      throw new MethodNotAllowedError(method);
  }
}

export default withTempestHandlers(memberTrackingRecordIdHandler, findUserByEmail);
