import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { MethodNotAllowedError, withErrorHandlingAndAuthorization } from '../../../middleware/withErrorHandling';
import { createTrackingItem, getTrackingItems } from '../../../repositories/trackingItemRepo';
import { getAc, permissionDenied } from '../../../middleware/utils';
import { EResource } from '../../../types/global';
import { LoggedInUser } from '../../../repositories/userRepo';
import { returnUser } from '../../../repositories/loginRepo';

const trackingItemHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) => {
  const { method, body } = req;

  const ac = await getAc();

  switch (method) {
    case 'GET': {
      const permission = ac.can(req.user.role.name).readAny(EResource.TRACKING_ITEM);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      const trackingItems = await getTrackingItems();

      return res.status(200).json({ trackingItems });
    }
    case 'POST': {
      const permission = ac.can(req.user.role.name).createAny(EResource.TRACKING_ITEM);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      const newItem = await createTrackingItem(body);

      return res.status(200).json(newItem);
    }
    default: {
      throw new MethodNotAllowedError(method);
    }
  }
};

export default withErrorHandlingAndAuthorization(trackingItemHandler, returnUser);
