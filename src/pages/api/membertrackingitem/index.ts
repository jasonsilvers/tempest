import { MemberTrackingItem } from '.prisma/client';
import { NextApiRequestWithAuthorization, withApiAuth } from '@tron/nextjs-auth-p1';
import dayjs from 'dayjs';
import { NextApiResponse } from 'next';
import { getAc, permissionDenied, recordNotFound } from '../../../middleware/utils';
import {
  createMemberTrackingItem,
  createMemberTrackingRecord,
  deleteMemberTrackingItem,
  findMemberTrackingItemById,
  findMemberTrackingRecords,
  updateMemberTrackingItem,
} from '../../../repositories/memberTrackingRepo';
import { findUserByDodId, UserWithRole } from '../../../repositories/userRepo';
import { EResource, ITempestApiError } from '../../../types/global';
import { getIncludesQueryArray } from '../../../utils/IncludeQuery';

enum EMemberTrackingItemIncludes {
  MEMBER_TRACKING_RECORDS = 'membertrackingrecords',
  TRACKING_ITEMS = 'trackingitems',
}

// Experiment with extending the NextApiRequestWithAuthorization from @tron/nextjs-auth-p1
// Asserts that Tempest will never use a string array as a query param for userId and TrackingItemId
interface ITempestMemberTrackingItemApiRequest<T, B = unknown> extends NextApiRequestWithAuthorization<T, B> {
  query: {
    userId: string;
    trackingItemId: string;
    include: EMemberTrackingItemIncludes | EMemberTrackingItemIncludes[];
    [key: string]: string | string[];
  };
}

async function memberTrackingItemHandler(
  req: ITempestMemberTrackingItemApiRequest<UserWithRole>,
  res: NextApiResponse<MemberTrackingItem | ITempestApiError>
) {
  const {
    // Add query for including membertrackingrecords
    query: { trackingItemId, userId, include, create_member_tracking_record, complete_date },
    method,
    body,
  } = req;

  const includesQuery = getIncludesQueryArray(include);
  const trackingItemIdParam = parseInt(trackingItemId);
  const memberTrackingRecordCompleteDate = complete_date?.toString();

  const ac = await getAc();

  switch (method) {
    case 'GET': {
      const memberTrackingItem = await findMemberTrackingItemById(trackingItemIdParam, userId, {
        withMemberTrackingRecords: includesQuery.includes(EMemberTrackingItemIncludes.MEMBER_TRACKING_RECORDS),
        withTrackingItems: includesQuery.includes(EMemberTrackingItemIncludes.TRACKING_ITEMS),
      });

      const permission =
        memberTrackingItem?.userId !== req.user.id
          ? ac.can(req.user.role.name).readAny(EResource.MEMBER_TRACKING_ITEM)
          : ac.can(req.user.role.name).readOwn(EResource.MEMBER_TRACKING_ITEM);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      if (!memberTrackingItem) {
        return recordNotFound(res);
      }

      res.status(200).json(memberTrackingItem);
      break;
    }

    case 'PUT': {
      const trackingRecordFromDb = await findMemberTrackingItemById(trackingItemIdParam, userId);

      if (!trackingRecordFromDb) {
        return recordNotFound(res);
      }

      const permission = ac.can(req.user.role.name).updateAny(EResource.MEMBER_TRACKING_ITEM);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      const filteredBody = permission.filter(body);

      const updatedMemberTrackingItem = await updateMemberTrackingItem(trackingItemIdParam, userId, filteredBody);
      res.status(200).json(updatedMemberTrackingItem);
      break;
    }

    case 'POST': {
      const permission =
        req.user.id !== body.userId
          ? ac.can(req.user.role.name).create(EResource.MEMBER_TRACKING_ITEM)
          : ac.can(req.user.role.name).createOwn(EResource.MEMBER_TRACKING_ITEM);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      const newMemberTrackingItem = await createMemberTrackingItem(body);

      if (create_member_tracking_record) {
        const newMemberTrackingRecord = await createMemberTrackingRecord(
          {
            traineeId: newMemberTrackingItem.userId,
            trackingItemId: newMemberTrackingItem.trackingItemId,
            completedDate: memberTrackingRecordCompleteDate ? dayjs(memberTrackingRecordCompleteDate).toDate() : null,
          },
          { includeTrackingItem: true }
        );

        newMemberTrackingItem.memberTrackingRecords = [newMemberTrackingRecord];
      }

      res.status(200).json(newMemberTrackingItem);
      break;
    }

    case 'DELETE': {
      const trackingRecordFromDb = await findMemberTrackingItemById(trackingItemIdParam, userId);

      if (!trackingRecordFromDb) {
        return recordNotFound(res);
      }
      const permission =
        trackingRecordFromDb.userId !== req.user.id
          ? ac.can(req.user.role.name).delete(EResource.MEMBER_TRACKING_ITEM)
          : ac.can(req.user.role.name).deleteOwn(EResource.MEMBER_TRACKING_ITEM);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      const memberTrackingRecords = await findMemberTrackingRecords(trackingItemIdParam, userId);

      if (memberTrackingRecords.length > 0) {
        return res.status(409).json({
          message: 'Unable to delete member tracking item when there are member tracking records',
        });
      }

      await deleteMemberTrackingItem(trackingItemIdParam, userId);

      res.status(204).end();
      break;
    }

    default:
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

export default withApiAuth(memberTrackingItemHandler, findUserByDodId);
