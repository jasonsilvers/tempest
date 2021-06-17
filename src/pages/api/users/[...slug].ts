import { User } from '@prisma/client';
import { NextApiRequestWithAuthorization, withApiAuth } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc, permissionDenied, recordNotFound } from '../../../middleware/utils';
import {
  findUserByDodId,
  findUserByIdWithMemberTrackingItems,
  UserWithMemberTrackingItems,
  LoggedInUser,
} from '../../../repositories/userRepo';
import { EResource, EUserIncludes, EUserResources, ITempestApiError } from '../../../types/global';
import { getIncludesQueryArray } from '../../../utils/IncludeQuery';

async function userSlugHandler(
  req: NextApiRequestWithAuthorization<LoggedInUser>,
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

      let user: UserWithMemberTrackingItems;

      if (resource === EUserResources.MEMBER_TRACKING_ITEMS) {
        user = await findUserByIdWithMemberTrackingItems(
          userId,
          includesQuery.includes(EUserIncludes.TRACKING_ITEMS) ? EUserIncludes.TRACKING_ITEMS : null
        );
      }

      if (!user) {
        return recordNotFound(res);
      }

      res.status(200).json(user);
      break;
    }

    default:
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

export default withApiAuth(userSlugHandler, findUserByDodId);
