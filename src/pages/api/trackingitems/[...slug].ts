import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { postUpdateTrackingItemAction } from '../../../controllers/trackingItemsController';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';

const trackingItemSlugPostSchema = {
  body: Joi.object({
    status: Joi.string().optional(),
  }),
  query: Joi.object({
    slug: Joi.required(),
    id: Joi.optional(),
  }),
};

const trackingItemSlugSchema = {
  post: trackingItemSlugPostSchema,
};

async function trackingItemSlugHandler(req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'POST') {
    throw new MethodNotAllowedError(method);
  }

  return postUpdateTrackingItemAction(req, res);
}

export default withTempestHandlers(trackingItemSlugHandler, findUserByEmail, trackingItemSlugSchema);
