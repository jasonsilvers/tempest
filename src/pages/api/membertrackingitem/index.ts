import { MemberTrackingItem } from '.prisma/client';
import {
  NextApiRequestWithAuthorization,
  withApiAuth,
} from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc } from '../../../middleware/utils';
import {
  createMemberTrackingItem,
  createTrackingRecord,
  MemberTrackingItemWithMemberTrackingRecord,
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
    query: { create_member_tracking_record },
  } = req;

  const ac = await getAc();

  const permission = ac.can(req.user.role.name).create(EResource.TRACKING_ITEM);

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
        const newMemberTrackingRecord = await createTrackingRecord(
          {
            traineeId: newMemberTrackingItem.userId,
            trackingItemId: newMemberTrackingItem.trackingItemId,
          },
          { includeTrackingItem: true }
        );

        newMemberTrackingItem.memberTrackingRecords = [newMemberTrackingRecord];
      }

      res.status(200).json(newMemberTrackingItem);
      break;
    }
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
};

export default withApiAuth(memberTrackingItemHandler, findUserByDodId);
