import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { LoggedInUser } from '../../../repositories/userRepo';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { returnUser } from '../../../repositories/loginRepo';
import { deleteTrackingItem } from '../../../repositories/trackingItemRepo';
import { getAc } from '../../../middleware/utils';
import { EResource } from '../../../const/enums';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';

async function trackingItemHandler(
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse
): Promise<void> {
  const { method } = req;

  const ac = await getAc();

  if (req.method !== 'DELETE') {
    throw new MethodNotAllowedError(method);
  }

  const permission = ac.can(req.user.role.name).deleteAny(EResource.TRACKING_ITEM);

  if (!permission.granted) {
    throw new PermissionError();
  }

  const trackingItemId = parseInt(req.query.id as string);

  if (isNaN(trackingItemId)) {
    return res.status(400).json({ message: 'Bad Request' });
  }

  const newItem = await deleteTrackingItem(trackingItemId);

  return res.status(200).json(newItem);
}

export default withTempestHandlers(trackingItemHandler, returnUser);
