import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { EResource, ERole } from '../../../const/enums';
import { getAc } from '../../../middleware/utils';
import { MethodNotAllowedError, NotFoundError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { returnUser } from '../../../repositories/loginRepo';
import { getOrganizationAndDown } from '../../../repositories/organizationRepo';
import { deleteTrackingItem, findTrackingItemById, updateTrackingItem } from '../../../repositories/trackingItemRepo';
import { LoggedInUser } from '../../../repositories/userRepo';

const isTrackingItemInRequestingUsersOrg = async (requestingUser: LoggedInUser, trackingItemOrgId: number) => {
  if (requestingUser.role.name === ERole.ADMIN) {
    return true;
  }

  if (requestingUser.organizationId === trackingItemOrgId) {
    return true;
  }

  const orgs = await getOrganizationAndDown(requestingUser.organizationId);

  return orgs.some((org) => org.id === trackingItemOrgId);
};

const trackingItemSchema = {
  put: {
    body: Joi.object({
      id: Joi.number().required(),
      location: Joi.string().optional().allow(null, ''),
      status: Joi.string().optional(),
      organizationId: Joi.number().optional().allow(null),
    }),
  },
};
async function trackingItemHandler(
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse
): Promise<void> {
  const { method, body, query } = req;
  const trackingItemId = query.id;
  const trackingItemIdParam = parseInt(trackingItemId as string);
  const ac = await getAc();

  if (method === 'PUT') {
    const trackingItem = await findTrackingItemById(trackingItemIdParam);

    if (!trackingItem) {
      throw new NotFoundError();
    }

    const permission = ac.can(req.user.role.name).updateAny(EResource.TRACKING_ITEM);

    const trackingItemIsInUsersOrg = await isTrackingItemInRequestingUsersOrg(req.user, trackingItem.organizationId);

    if (!permission.granted || !trackingItemIsInUsersOrg) {
      throw new PermissionError();
    }

    const updatedTrackingItem = await updateTrackingItem(trackingItemIdParam, body);
    return res.status(200).json(updatedTrackingItem);
  }

  //update permissions
  if (method === 'DELETE') {
    const permission = ac.can(req.user.role.name).deleteAny(EResource.TRACKING_ITEM);

    if (!permission.granted) {
      throw new PermissionError();
    }

    if (isNaN(trackingItemIdParam)) {
      return res.status(400).json({ message: 'Bad Request' });
    }

    const newItem = await deleteTrackingItem(trackingItemIdParam);

    return res.status(200).json(newItem);
  }
  throw new MethodNotAllowedError(method);
}

export default withTempestHandlers(trackingItemHandler, returnUser, trackingItemSchema);
