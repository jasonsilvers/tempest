import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { EResource } from '../../../const/enums';
import { getAc } from '../../../middleware/utils';
import { BadRequestError, MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { getPPEItemsByUserId } from '../../../repositories/ppeItemsRepo';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';
import { PPEItemsDTO } from '../../../types';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';

interface ITempestppeItemsApiRequest<T, B = unknown> extends NextApiRequestWithAuthorization<T, B> {
  query: {
    userId: string;
  };
}

const ppeItemsHandler = async (req: ITempestppeItemsApiRequest<LoggedInUser>, res: NextApiResponse<PPEItemsDTO>) => {
  const {
    method,
    query: { userId },
  } = req;

  if (!userId) {
    throw new BadRequestError();
  }

  const userIdFilter = parseInt(userId);

  if (method !== 'GET') {
    throw new MethodNotAllowedError(method);
  }

  const ac = await getAc();

  const permission =
    req.user.id !== userIdFilter
      ? ac.can(req.user.role.name).readAny(EResource.PPE_ITEM)
      : ac.can(req.user.role.name).readOwn(EResource.PPE_ITEM);

  if (!permission.granted) {
    throw new PermissionError();
  }

  const ppeItems = await getPPEItemsByUserId(userIdFilter);

  res.status(200).json({ ppeItems });
};

export default withTempestHandlers(ppeItemsHandler, findUserByEmail);
