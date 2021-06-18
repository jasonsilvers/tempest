import { MemberTrackingItem } from '@prisma/client';
import dayjs from 'dayjs';
import { NextApiResponse } from 'next';
import { getAc, permissionDenied, recordNotFound } from '../middleware/utils';
import { ITempestMemberTrackingItemApiRequest } from '../pages/api/membertrackingitems';
import {
  findMemberTrackingItemById,
  updateMemberTrackingItem,
  createMemberTrackingItem,
  createMemberTrackingRecord,
  findMemberTrackingRecords,
  deleteMemberTrackingItem,
} from '../repositories/memberTrackingRepo';
import { UserWithRole } from '../repositories/userRepo';
import { ITempestApiError, EResource } from '../types/global';
import { getIncludesQueryArray } from '../utils/IncludeQuery';

export enum EMemberTrackingItemIncludes {
  MEMBER_TRACKING_RECORDS = 'membertrackingrecords',
  TRACKING_ITEMS = 'trackingitems',
}

type IMemberTrackingItemController = (
  req: ITempestMemberTrackingItemApiRequest<UserWithRole>,
  res: NextApiResponse<MemberTrackingItem | ITempestApiError>
) => Promise<void>;

export const getMemberTrackingItemAction: IMemberTrackingItemController = async (req, res) => {
  const {
    // Add query for including membertrackingrecords
    query: { trackingItemId, userId, include },
  } = req;

  const includesQuery = getIncludesQueryArray(include);
  const trackingItemIdParam = parseInt(trackingItemId);

  const ac = await getAc();

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
};

export const putMemberTrackingItemAction: IMemberTrackingItemController = async (req, res) => {
  const {
    // Add query for including membertrackingrecords
    query: { trackingItemId, userId },
    body,
  } = req;

  const trackingItemIdParam = parseInt(trackingItemId);
  const ac = await getAc();

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
};

export const postMemberTrackingItemAction: IMemberTrackingItemController = async (req, res) => {
  const {
    // Add query for including membertrackingrecords
    query: { create_member_tracking_record, complete_date },
    body,
  } = req;

  const memberTrackingRecordCompleteDate = complete_date?.toString();

  const ac = await getAc();
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
};

export const deleteMemberTrackingItemAction: IMemberTrackingItemController = async (req, res) => {
  const {
    // Add query for including membertrackingrecords
    query: { trackingItemId, userId },
  } = req;

  const trackingItemIdParam = parseInt(trackingItemId);

  const ac = await getAc();
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

  res.status(204).json({ message: 'Record deleted' });
};
