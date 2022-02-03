import { MemberTrackingItem } from '@prisma/client';
import Joi from 'joi';
const dayjs = require('dayjs');
import { NextApiResponse } from 'next';
import { getAc } from '../middleware/utils';
import { ITempestMemberTrackingItemApiRequest } from '../pages/api/membertrackingitems';
import {
  findMemberTrackingItemById,
  updateMemberTrackingItem,
  createMemberTrackingItem,
  createMemberTrackingRecord,
  findMemberTrackingRecords,
  deleteMemberTrackingItem,
} from '../repositories/memberTrackingRepo';
import { LoggedInUser } from '../repositories/userRepo';
import { ITempestApiError, EResource } from '../const/enums';
import { getIncludesQueryArray } from '../utils/includeQuery';
import { NotFoundError, PermissionError } from '../middleware/withErrorHandling';
import { userHasPermissionWithinOrg } from '../utils/userHasPermissionWithinOrg';

export enum EMemberTrackingItemIncludes {
  MEMBER_TRACKING_RECORDS = 'membertrackingrecords',
  TRACKING_ITEMS = 'trackingitems',
}

type IMemberTrackingItemController = (
  req: ITempestMemberTrackingItemApiRequest<LoggedInUser>,
  res: NextApiResponse<MemberTrackingItem | ITempestApiError>
) => Promise<void>;

export const memberTrackingItemGetSchema = {
  query: Joi.object({
    slug: Joi.optional(),
    id: Joi.optional(),
    include: Joi.optional(),
    userId: Joi.string().required(),
    trackingItemId: Joi.string().required(),
  }),
};

export const getMemberTrackingItemAction: IMemberTrackingItemController = async (req, res) => {
  const {
    // Add query for including membertrackingrecords
    query: { trackingItemId, userId, include },
  } = req;

  const includesQuery = getIncludesQueryArray(include);
  const userIdParam = parseInt(userId);
  const trackingItemIdParam = parseInt(trackingItemId);

  const ac = await getAc();

  const memberTrackingItem = await findMemberTrackingItemById(trackingItemIdParam, userIdParam, {
    withMemberTrackingRecords: includesQuery.includes(EMemberTrackingItemIncludes.MEMBER_TRACKING_RECORDS),
    withTrackingItems: includesQuery.includes(EMemberTrackingItemIncludes.TRACKING_ITEMS),
  });

  if (!memberTrackingItem) {
    throw new NotFoundError();
  }

  const permission =
    memberTrackingItem?.userId !== req.user.id
      ? ac.can(req.user.role.name).readAny(EResource.MEMBER_TRACKING_ITEM)
      : ac.can(req.user.role.name).readOwn(EResource.MEMBER_TRACKING_ITEM);

  if (
    !(await userHasPermissionWithinOrg(
      { id: req.user.id, orgId: req.user.organizationId },
      {
        id: memberTrackingItem.user.id,
        orgId: memberTrackingItem.user.organizationId,
      }
    ))
  ) {
    throw new PermissionError();
  }

  if (!permission.granted) {
    throw new PermissionError();
  }

  res.status(200).json(memberTrackingItem);
};

export const memberTrackingItemPutSchema = {
  body: Joi.object({
    isActive: Joi.boolean().required(),
  }),
  query: Joi.object({
    slug: Joi.optional(),
    id: Joi.optional(),
    trackingItemId: Joi.string().optional(),
    userId: Joi.string().optional(),
  }),
};

export const putMemberTrackingItemAction: IMemberTrackingItemController = async (req, res) => {
  const {
    // Add query for including membertrackingrecords
    query: { trackingItemId, userId },
    body,
  } = req;

  const trackingItemIdParam = parseInt(trackingItemId);
  const userIdParam = parseInt(userId);
  const ac = await getAc();

  const memberTrackingItem = await findMemberTrackingItemById(trackingItemIdParam, userIdParam);

  if (!memberTrackingItem) {
    throw new NotFoundError();
  }

  const permission = ac.can(req.user.role.name).updateAny(EResource.MEMBER_TRACKING_ITEM);

  if (
    !(await userHasPermissionWithinOrg(
      { id: req.user.id, orgId: req.user.organizationId },
      {
        id: memberTrackingItem.user.id,
        orgId: memberTrackingItem.user.organizationId,
      }
    ))
  ) {
    throw new PermissionError();
  }

  if (!permission.granted) {
    throw new PermissionError();
  }

  const filteredBody = permission.filter(body);

  const updatedMemberTrackingItem = await updateMemberTrackingItem(trackingItemIdParam, userIdParam, filteredBody);
  res.status(200).json(updatedMemberTrackingItem);
};

export const memberTrackingItemPostSchema = {
  body: Joi.object({
    isActive: Joi.boolean().required(),
    userId: Joi.number().required(),
    trackingItemId: Joi.number().required(),
  }),
  query: Joi.object({
    slug: Joi.optional(),
    id: Joi.optional(),
    create_member_tracking_record: Joi.boolean().optional(),
    complete_date: Joi.date().optional(),
  }),
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
    throw new PermissionError();
  }

  if (
    !(await userHasPermissionWithinOrg(
      { id: req.user.id, orgId: req.user.organizationId },
      {
        id: body.userId,
        orgId: null,
      }
    ))
  ) {
    throw new PermissionError();
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
  const userIdParam = parseInt(userId);

  const ac = await getAc();
  const memberTrackingItem = await findMemberTrackingItemById(trackingItemIdParam, userIdParam);

  if (!memberTrackingItem) {
    throw new NotFoundError();
  }
  const permission =
    memberTrackingItem.userId !== req.user.id
      ? ac.can(req.user.role.name).delete(EResource.MEMBER_TRACKING_ITEM)
      : ac.can(req.user.role.name).deleteOwn(EResource.MEMBER_TRACKING_ITEM);

  if (!permission.granted) {
    throw new PermissionError();
  }

  if (
    !(await userHasPermissionWithinOrg(
      { id: req.user.id, orgId: req.user.organizationId },
      {
        id: memberTrackingItem.user.id,
        orgId: memberTrackingItem.user.organizationId,
      }
    ))
  ) {
    throw new PermissionError();
  }

  const memberTrackingRecords = await findMemberTrackingRecords(trackingItemIdParam, userIdParam);

  if (memberTrackingRecords.length > 0) {
    return res.status(409).json({
      message: 'Unable to delete member tracking item when there are member tracking records',
    });
  }

  await deleteMemberTrackingItem(trackingItemIdParam, userIdParam);

  res.status(204).json({ message: 'Record deleted' });
};
