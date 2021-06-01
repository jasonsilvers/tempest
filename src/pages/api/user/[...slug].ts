import { User } from '@prisma/client';
import { NextApiRequestWithAuthorization, withApiAuth } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc, permissionDenied, recordNotFound } from '../../../middleware/utils';
import { findUserByDodId, findUserById, UserWithRole } from '../../../repositories/userRepo';
import { EResource, ITempestApiError } from '../../../types/global';
import { getIncludesQueryArray } from '../../../utils/IncludeQuery';

enum EUserIncludes {
  MEMBER_TRACKING_ITEMS = 'membertrackingitems',
  MEMBER_TRACKING_RECORDS = 'membertrackingrecords',
  TRACKING_ITEMS = 'trackingitems',
}

async function userSlugHandler(
  req: NextApiRequestWithAuthorization<UserWithRole>,
  res: NextApiResponse<User | ITempestApiError>
) {
  const {
    query: { slug, include },
    method,
  } = req;

  const userId = slug[0];
  const resource = slug[1];

  const includesQuery = getIncludesQueryArray(include);

  const ac = await getAc();

  switch (method) {
    case 'GET': {
      const permission =
        userId !== req.user.id
          ? ac.can(req.user.role.name).readAny(EResource.USER)
          : ac.can(req.user.role.name).readOwn(EResource.USER);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      const user = await findUserById(userId, {
        withTrackingItems: includesQuery.includes(EUserIncludes.TRACKING_ITEMS),
        withMemberTrackingRecords: includesQuery.includes(EUserIncludes.MEMBER_TRACKING_RECORDS),
        withMemberTrackingItems: resource === EUserIncludes.MEMBER_TRACKING_ITEMS,
      });

      if (!user) {
        return recordNotFound(res);
      }

      res.status(200).json(user);
      break;
    }

    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withApiAuth(userSlugHandler, findUserByDodId);
