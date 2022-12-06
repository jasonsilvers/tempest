import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import {
  getTrackingItemAction,
  postTrackingItemAction,
  trackingItemPostSchema,
} from '../../../../controllers/trackingItemsController';
import { MethodNotAllowedError } from '../../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../../middleware/withTempestHandlers';
import { returnUser } from '../../../../repositories/loginRepo';
import { LoggedInUser } from '../../../../repositories/userRepo';

const trackingItemHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case 'GET': {
      return getTrackingItemAction(req, res);
    }
    case 'POST': {
      return postTrackingItemAction(req, res);
    }
    default: {
      throw new MethodNotAllowedError(method);
    }
  }
};

export default withTempestHandlers(trackingItemHandler, returnUser, trackingItemPostSchema);
