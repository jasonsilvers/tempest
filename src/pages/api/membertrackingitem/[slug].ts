import {
  NextApiRequestWithAuthorization,
  withApiAuth,
} from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc } from '../../../middleware/utils';
import {
  deleteMemberTrackingItem,
  findMemberTrackingItemById,
  findMemberTrackingRecords,
} from '../../../repositories/memberTrackingRepo';
import { findUserByDodId, UserWithRole } from '../../../repositories/userRepo';
import {
  EResource,
  ErrorMessage403,
  ITempestApiError,
} from '../../../types/global';
export const memberTrackingItemHandlerSlug = async (
  req: NextApiRequestWithAuthorization<UserWithRole>,
  res: NextApiResponse<any | ITempestApiError>
) => {
  const {
    query: { slug },
    method,
  } = req;

  const trackingItemId = parseInt(slug[0].toString());
  const userId = slug[2].toString();

  switch (method) {
    case 'DELETE': {
      const trackingRecordFromDb = await findMemberTrackingItemById(
        trackingItemId,
        userId
      );

      if (!trackingRecordFromDb) {
        return res.status(404).json({ message: 'Record Not Found' });
      }

      const ac = await getAc();
      const permission =
        trackingRecordFromDb.userId !== req.user.id
          ? ac.can(req.user.role.name).delete(EResource.TRACKING_ITEM)
          : ac.can(req.user.role.name).deleteOwn(EResource.TRACKING_ITEM);

      if (!permission.granted) {
        return res.status(403).json(ErrorMessage403);
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
      res.setHeader('Allow', ['DELETE']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
};

export default withApiAuth(memberTrackingItemHandlerSlug, findUserByDodId);
