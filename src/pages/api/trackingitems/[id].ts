import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { LoggedInUser } from '../../../repositories/userRepo';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { returnUser } from '../../../repositories/loginRepo';
import { deleteTrackingItem, updateTrackingItem } from '../../../repositories/trackingItemRepo';
import { getAc } from '../../../middleware/utils';
import { EResource } from '../../../const/enums';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import Joi from 'joi';

const trackingItemSchema = {
  put: {
    body: Joi.object({
      id: Joi.number().required(),
      location: Joi.string().optional().allow(null, ''),
      status: Joi.string().optional(),
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
    const permission = ac.can(req.user.role.name).updateAny(EResource.TRACKING_ITEM);
    if (!permission.granted) {
      throw new PermissionError();
    }

    const updatedTrackingItem = await updateTrackingItem(trackingItemIdParam, body);
    return res.status(200).json(updatedTrackingItem);
  }

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
