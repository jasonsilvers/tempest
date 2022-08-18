import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import {
  BadRequestError,
  MethodNotAllowedError,
  NotFoundError,
  PermissionError,
} from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';
import { ETrackingItemVerb, EResource, ERole } from '../../../const/enums';
import { findTrackingByIdIncludeCount, updateTrackingItem } from '../../../repositories/trackingItemRepo';
import { TrackingItem, MemberTrackingItemStatus, TrackingItemStatus } from '@prisma/client';
import { getAc } from '../../../middleware/utils';
import { updateManyMemberTrackingItemsByTrackingItemId } from '../../../repositories/memberTrackingRepo';

const trackingItemSlugPostSchema = {
  query: Joi.object({
    slug: Joi.required(),
  }),
};

const trackingItemSlugSchema = {
  post: trackingItemSlugPostSchema,
};

async function trackingItemSlugHandler(req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) {
  const {
    method,
    query: { slug },
  } = req;

  if (method !== 'POST') {
    throw new MethodNotAllowedError(method);
  }

  const trackingItemId = parseInt(slug[0]);
  const verb = slug[1];

  const ac = await getAc();

  if (!Object.values(ETrackingItemVerb).includes(verb as ETrackingItemVerb)) {
    throw new BadRequestError();
  }
  const trackingItemFromDb = await findTrackingByIdIncludeCount(trackingItemId);

  if (!trackingItemFromDb) {
    throw new NotFoundError();
  }

  if (trackingItemFromDb.organizationId === null && req.user.role.name !== ERole.ADMIN) {
    throw new PermissionError('You are not authorized to update training items in the global catalog');
  }

  const permission = ac.can(req.user.role.name).updateAny(EResource.TRACKING_ITEM);

  if (!permission.granted) {
    throw new PermissionError();
  }

  let updatedTrackingItem: TrackingItem;

  if (verb === ETrackingItemVerb.ARCHIVE) {
    updatedTrackingItem = await updateTrackingItem(trackingItemId, { status: TrackingItemStatus.INACTIVE });
    await updateManyMemberTrackingItemsByTrackingItemId(trackingItemId, { status: MemberTrackingItemStatus.INACTIVE });
  }

  if (verb === ETrackingItemVerb.UNARCHIVE) {
    updatedTrackingItem = await updateTrackingItem(trackingItemId, { status: TrackingItemStatus.ACTIVE });
    await updateManyMemberTrackingItemsByTrackingItemId(trackingItemId, { status: MemberTrackingItemStatus.ACTIVE });
  }

  return res.status(200).json(updatedTrackingItem);
}

export default withTempestHandlers(trackingItemSlugHandler, findUserByEmail, trackingItemSlugSchema);
