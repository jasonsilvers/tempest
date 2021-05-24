import { MemberTrackingItem } from '.prisma/client';
import {
  NextApiRequestWithAuthorization,
  withApiAuth,
} from '@tron/nextjs-auth-p1';
import dayjs from 'dayjs';
import { NextApiResponse } from 'next';
import { getAc } from '../../../middleware/utils';
import {
  createMemberTrackingItem,
  createMemberTrackingRecord,
  MemberTrackingItemWithMemberTrackingRecord,
  MemberTrackingRecordWithTrackingItem,
} from '../../../repositories/memberTrackingRepo';
import { findUserByDodId, UserWithRole } from '../../../repositories/userRepo';
import { EResource, ITempestApiError } from '../../../types/global';

const memberTrackingItemHandler = async (
  req: NextApiRequestWithAuthorization<UserWithRole>,
  res: NextApiResponse<MemberTrackingItem | ITempestApiError>
) => {
  //Include can be a string or string[]
  const {
    body,
    method,
    query: { create_member_tracking_record, complete_date },
  } = req;

  const memberTrackingRecordCompleteDate = complete_date?.toString();

  const ac = await getAc();

  const permission =
    req.user.id !== body.userId
      ? ac.can(req.user.role.name).create(EResource.MEMBER_TRACKING_ITEM)
      : ac.can(req.user.role.name).createOwn(EResource.MEMBER_TRACKING_ITEM);

  if (!permission.granted) {
    return res
      .status(403)
      .json({ message: 'You do not have the correct permissions' });
  }

  switch (method) {
    case 'POST': {
      const newMemberTrackingItem: MemberTrackingItemWithMemberTrackingRecord = await createMemberTrackingItem(
        body
      );

      if (create_member_tracking_record) {
        const newMemberTrackingRecord: MemberTrackingRecordWithTrackingItem = await createMemberTrackingRecord(
          {
            traineeId: newMemberTrackingItem.userId,
            trackingItemId: newMemberTrackingItem.trackingItemId,
            completedDate: dayjs(memberTrackingRecordCompleteDate).toDate(),
          },
          { includeTrackingItem: true }
        );

        newMemberTrackingItem.memberTrackingRecords = [newMemberTrackingRecord];
      }

      res.status(200).json(newMemberTrackingItem);
      break;
    }
    default:
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
};

export default withApiAuth(memberTrackingItemHandler, findUserByDodId);
