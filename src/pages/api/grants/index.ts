import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import { findGrants } from '../../../repositories/grantsRepo';
import { GrantsDTO } from '../../../types';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';

const grantsHandler = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<GrantsDTO | { message: string }>
) => {
  if (req.method !== 'GET') {
    throw new MethodNotAllowedError(req.method);
  }

  const grants = await findGrants();

  res.status(200).json({ grants });
};

export default withTempestHandlers(grantsHandler, findUserByDodId);
