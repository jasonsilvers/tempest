import { User } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc } from '../../../middleware/utils';
import {
  BadRequestError,
  MethodNotAllowedError,
  NotFoundError,
  PermissionError,
} from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import {
  findUserByEmail,
  findUserByIdWithMemberTrackingItems,
  UserWithMemberTrackingItems,
  LoggedInUser,
  findUserById,
  FindUserById,
} from '../../../repositories/userRepo';
import { EResource, EMtrVariant, EUserResources, ITempestApiMessage } from '../../../const/enums';

async function userSlugHandler(
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiMessage>
) {
  const {
    query: { slug },
    method,
  } = req;

  if (method !== 'GET') {
    throw new MethodNotAllowedError(method);
  }

  const userId = slug[0];
  const resource = slug[1] as EUserResources;
  const variant = slug[2] as EMtrVariant;

  const userIdParam = parseInt(userId);

  if (resource && !Object.values(EUserResources).includes(resource)) {
    throw new NotFoundError();
  }

  if (variant && !Object.values(EMtrVariant).includes(variant)) {
    console.log('test');
    throw new BadRequestError();
  }

  const ac = await getAc();

  const permission =
    userIdParam !== req.user.id
      ? ac.can(req.user.role.name).readAny(EResource.USER)
      : ac.can(req.user.role.name).readOwn(EResource.USER);

  if (!permission.granted) {
    throw new PermissionError();
  }

  let user: UserWithMemberTrackingItems | FindUserById;

  if (resource === EUserResources.MEMBER_TRACKING_ITEMS) {
    user = await findUserByIdWithMemberTrackingItems(userIdParam, resource, variant);
  } else {
    user = await findUserById(userIdParam);
  }

  if (!user) {
    throw new NotFoundError();
  }

  res.status(200).json(user);
}

export default withTempestHandlers(userSlugHandler, findUserByEmail);
