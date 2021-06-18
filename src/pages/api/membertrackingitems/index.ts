import { MemberTrackingItem } from '.prisma/client';
import { NextApiRequestWithAuthorization, withApiAuth } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import {
  getMemberTrackingItemAction,
  putMemberTrackingItemAction,
  postMemberTrackingItemAction,
  deleteMemberTrackingItemAction,
  EMemberTrackingItemIncludes,
} from '../../../controllers/memberTrackingItemsController';
export interface ITempestMemberTrackingItemApiRequest<T> extends NextApiRequestWithAuthorization<T> {
  query: {
    userId: string;
    trackingItemId: string;
    include: EMemberTrackingItemIncludes | EMemberTrackingItemIncludes[];
    [key: string]: string | string[];
  };
  body: MemberTrackingItem;
}

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
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

export default withApiAuth(memberTrackingItemHandler, findUserByDodId);
