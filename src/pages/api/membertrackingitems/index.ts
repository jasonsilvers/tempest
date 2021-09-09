import { MemberTrackingItem } from '.prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import {
  getMemberTrackingItemAction,
  putMemberTrackingItemAction,
  postMemberTrackingItemAction,
  deleteMemberTrackingItemAction,
  EMemberTrackingItemIncludes,
  memberTrackingItemPostSchema,
  memberTrackingItemPutSchema,
  memberTrackingItemGetSchema,
} from '../../../controllers/memberTrackingItemsController';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
export interface ITempestMemberTrackingItemApiRequest<T> extends NextApiRequestWithAuthorization<T> {
  query: {
    userId: string;
    trackingItemId: string;
    include: EMemberTrackingItemIncludes | EMemberTrackingItemIncludes[];
    [key: string]: string | string[];
  };
  body: MemberTrackingItem;
}

const memberTrackingItemSchema = {
  get: memberTrackingItemGetSchema,
  post: memberTrackingItemPostSchema,
  put: memberTrackingItemPutSchema,
};

async function memberTrackingItemHandler(
  req: ITempestMemberTrackingItemApiRequest<LoggedInUser>,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET': {
      return getMemberTrackingItemAction(req, res);
    }

    case 'PUT': {
      return putMemberTrackingItemAction(req, res);
    }

    case 'POST': {
      return postMemberTrackingItemAction(req, res);
    }

    case 'DELETE': {
      return deleteMemberTrackingItemAction(req, res);
    }

    default:
      throw new MethodNotAllowedError(method);
  }
}

export default withTempestHandlers(memberTrackingItemHandler, findUserByDodId, memberTrackingItemSchema);
