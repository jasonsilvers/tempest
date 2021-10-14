import { User } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc } from '../../../middleware/utils';
import { MethodNotAllowedError, NotFoundError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import {
  findUserByDodId,
  findUserByIdWithMemberTrackingItems,
  UserWithMemberTrackingItems,
  LoggedInUser,
} from '../../../repositories/userRepo';
import { EResource, EUserIncludes, EUserResources, ITempestApiError } from '../../../const/enums';
import { getIncludesQueryArray } from '../../../utils/includeQuery';

async function userSlugHandler(
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiError>
) {
  const {
    query: { slug, include },
    method,
  } = req;

  if (method !== 'GET') {
    throw new MethodNotAllowedError(method);
  }

  const userId = slug[0];
  const resource = slug[1];

  const includesQuery = getIncludesQueryArray(include);

  const ac = await getAc();

  const permission =
    userId !== req.user.id
      ? ac.can(req.user.role.name).readAny(EResource.USER)
      : ac.can(req.user.role.name).readOwn(EResource.USER);

  if (!permission.granted) {
    throw new PermissionError();
  }

  let user: UserWithMemberTrackingItems;

  if (resource === EUserResources.MEMBER_TRACKING_ITEMS) {
    user = await findUserByIdWithMemberTrackingItems(
      userId,
      includesQuery.includes(EUserIncludes.TRACKING_ITEM) ? EUserIncludes.TRACKING_ITEM : null
    );
  }

  if (!user) {
    throw new NotFoundError();
  }

  res.status(200).json(user);
}

export default withTempestHandlers(userSlugHandler, findUserByDodId);
