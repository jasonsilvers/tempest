import { MemberTrackingItem } from '.prisma/client';
import {
  NextApiRequestWithAuthorization,
  withApiAuth,
} from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import {
  getAc,
  permissionDenied,
  recordNotFound,
} from '../../../middleware/utils';
import {
  deleteMemberTrackingItem,
  findMemberTrackingItemById,
  findMemberTrackingRecords,
  updateMemberTrackingItem,
} from '../../../repositories/memberTrackingRepo';
import { findUserByDodId, UserWithRole } from '../../../repositories/userRepo';
import { EResource, ITempestApiError } from '../../../types/global';

export const memberTrackingItemHandlerSlug = async (
  req: NextApiRequestWithAuthorization<UserWithRole>,
  res: NextApiResponse<MemberTrackingItem | ITempestApiError>
) => {
  const {
    query: { slug },
    method,
    body,
  } = req;

  const trackingItemId = parseInt(slug[0].toString());
  const userId = slug[2].toString();

  const trackingRecordFromDb = await findMemberTrackingItemById(
    trackingItemId,
    userId
  );

  if (!trackingRecordFromDb) {
    return recordNotFound(res);
  }

  const ac = await getAc();

  switch (method) {
    case 'PUT': {
      const permission = ac
        .can(req.user.role.name)
        .updateAny(EResource.MEMBER_TRACKING_ITEM);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      const filteredBody = permission.filter(body);

      const updatedMemberTrackingItem = await updateMemberTrackingItem(
        trackingItemId,
        userId,
        filteredBody
      );
      res.status(200).json(updatedMemberTrackingItem);
      break;
    }

    case 'DELETE': {
      const permission =
        trackingRecordFromDb.userId !== req.user.id
          ? ac.can(req.user.role.name).delete(EResource.MEMBER_TRACKING_ITEM)
          : ac
              .can(req.user.role.name)
              .deleteOwn(EResource.MEMBER_TRACKING_ITEM);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      const memberTrackingRecords = await findMemberTrackingRecords(
        trackingItemId,
        userId
      );

      if (memberTrackingRecords.length > 0) {
        return res.status(409).json({
          message:
            'Unable to delete member tracking item when there are member tracking records',
        });
      }

      await deleteMemberTrackingItem(trackingItemId, userId);

      res.status(204).end();
      break;
    }

    default:
      res.setHeader('Allow', ['DELETE, PUT']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
};

export default withApiAuth(memberTrackingItemHandlerSlug, findUserByDodId);
