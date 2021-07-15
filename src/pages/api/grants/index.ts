import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import { findGrants } from '../../../repositories/grantsRepo';
import { GrantsDTO } from '../../../types/global';
import { logFactory } from '../../../utils/logger';
import { withErrorHandlingAndAuthorization } from '../../../middleware/withErrorHandling';

const grantsHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse<GrantsDTO>) => {
  res.statusCode = 200;

  const log = logFactory(req.user);
  log.info('API Grants');

  const grants = await findGrants();

  res.json({ grants });
};

export default withErrorHandlingAndAuthorization(grantsHandler, findUserByDodId);