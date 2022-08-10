import { TrackingItem, TrackingItemStatus } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { EResource, ERole, ITempestApiMessage } from '../const/enums';
import { getAc } from '../middleware/utils';
import { NotFoundError, PermissionError } from '../middleware/withErrorHandling';
import { getOrganizationAndDown, getOrganizationAndUp } from '../repositories/organizationRepo';
import {
  createTrackingItem,
  findTrackingItemById,
  getGlobalTrackingItemsAndThoseByOrgId,
  updateTrackingItem,
} from '../repositories/trackingItemRepo';
import { LoggedInUser } from '../repositories/userRepo';
import { TrackingItemsDTO } from '../types';

export const getTrackingItemAction = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<TrackingItemsDTO>
) => {
  let orgIds: number[];
  let trackingItems: TrackingItem[];
  const ac = await getAc();
  const permission = ac.can(req.user.role.name).readAny(EResource.TRACKING_ITEM);

  if (!permission.granted) {
    throw new PermissionError();
  }

  if (req.user.role.name === ERole.MONITOR || req.user.role.name === ERole.ADMIN) {
    const orgsAndUp = await getOrganizationAndUp(req.user.organizationId);
    const orgsAndDown = await getOrganizationAndDown(req.user.organizationId);
    orgIds = [...orgsAndUp, ...orgsAndDown].map((org) => org.id);
    trackingItems = await getGlobalTrackingItemsAndThoseByOrgId(orgIds);
  }

  if (req.user.role.name === ERole.MEMBER) {
    const orgsAndUp = await getOrganizationAndUp(req.user.organizationId);
    orgIds = orgsAndUp.map((org) => org.id);
    trackingItems = await getGlobalTrackingItemsAndThoseByOrgId(orgIds);
  }

  return res.status(200).json({ trackingItems });
};

export const trackingItemPostSchema = {
  post: {
    body: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().optional().allow(null, ''),
      interval: Joi.number().required(),
      location: Joi.string().optional().allow(null, ''),
      organizationId: Joi.number().optional().allow(null, 0),
    }),
  },
};

export const postTrackingItemAction = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<TrackingItem | ITempestApiMessage>
) => {
  //Check role - admin is only one able to create trackingItems with null OrganizationId
  //Check orgId of tracking item make sure requesting user has access and that org is of type catalog

  const { body } = req;

  if (body.organizationId === null && req.user.role.name !== ERole.ADMIN) {
    throw new PermissionError('You are not authorized to create training items in the global catalog');
  }

  const orgs = await getOrganizationAndDown(req.user.organizationId);
  const orgToAddTrainingItemTo = orgs.find((org) => org.id === body.organizationId);

  if (!orgToAddTrainingItemTo?.types?.includes('CATALOG') && req.user.role.name !== ERole.ADMIN) {
    throw new PermissionError('You are not authorized to create a training item in that organization');
  }
  const ac = await getAc();
  const permission = ac.can(req.user.role.name).createAny(EResource.TRACKING_ITEM);

  if (!permission.granted) {
    throw new PermissionError();
  }

  let newItem: TrackingItem;

  try {
    newItem = await createTrackingItem(body);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(500).json({ message: 'Duplicates not allowed' });
    }
    return res.status(500).json({ message: 'An error occured. Please try again' });
  }

  return res.status(200).json(newItem);
};

const archiveTrackingItem = (_trackingItemId: string | number, recordFromDb: TrackingItem) => {
  return {
    ...recordFromDb,
    status: TrackingItemStatus.INACTIVE,
  } as TrackingItem;
};

const unarchiveTrackingItem = (_trackingItemId: string | number, recordFromDb: TrackingItem) => {
  return {
    ...recordFromDb,
    status: TrackingItemStatus.ACTIVE,
  } as TrackingItem;
};

export const postUpdateTrackingItemAction = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<TrackingItem | ITempestApiMessage>
) => {
  // put destructured req object back

  const recordFromDb = await findTrackingItemById(1);

  if (!recordFromDb) {
    throw new NotFoundError();
  }
  const ac = await getAc();
  const permission = ac.can(req.user.role.name).updateAny(EResource.TRACKING_ITEM);

  if (!permission.granted) {
    throw new PermissionError();
  }

  let updatedTrackingItem: TrackingItem;

  if (TrackingItemStatus.INACTIVE) {
    updatedTrackingItem = archiveTrackingItem(1, recordFromDb);
  }

  if (TrackingItemStatus.ACTIVE) {
    updatedTrackingItem = unarchiveTrackingItem(1, recordFromDb);
  }

  const filteredTrackingItem = permission.filter(updatedTrackingItem);
  const updatedTrackingItemFromDb = await updateTrackingItem(1, filteredTrackingItem);

  res.status(200).json(updatedTrackingItemFromDb);
};
