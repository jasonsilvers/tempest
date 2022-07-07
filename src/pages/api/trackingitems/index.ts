import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { createTrackingItem, getTrackingItems } from '../../../repositories/trackingItemRepo';
import { getAc } from '../../../middleware/utils';
import { EResource } from '../../../const/enums';
import { LoggedInUser } from '../../../repositories/userRepo';
import { returnUser } from '../../../repositories/loginRepo';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import Joi from 'joi';
import { TrackingItem } from '.prisma/client';

const trackingItemPostSchema = {
  post: {
    body: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().optional().allow(null, ''),
      interval: Joi.number().required(),
      location: Joi.string().optional().allow(null, ''),
    }),
  },
};

const trackingItemHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) => {
  const { method, body } = req;

  const ac = await getAc();

  switch (method) {
    case 'GET': {
      const permission = ac.can(req.user.role.name).readAny(EResource.TRACKING_ITEM);

      if (!permission.granted) {
        throw new PermissionError();
      }

      const trackingItems = await getTrackingItems();

      return res.status(200).json({ trackingItems });
    }
    case 'POST': {
      const permission = ac.can(req.user.role.name).createAny(EResource.TRACKING_ITEM);

      if (!permission.granted) {
        throw new PermissionError();
      }

      let newItem: Partial<TrackingItem>;

      try {
        newItem = await createTrackingItem(body);
      } catch (error) {
        if (error.code === 'P2002') {
          return res.status(500).json({ message: 'Duplicates not allowed' });
        }
        return res.status(500).json({ message: 'An error occured. Please try again' });
      }

      return res.status(200).json(newItem);
    }
    default: {
      throw new MethodNotAllowedError(method);
    }
  }
};

export default withTempestHandlers(trackingItemHandler, returnUser, trackingItemPostSchema);
