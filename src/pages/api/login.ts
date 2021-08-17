import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { updateLastLogin, LoggedInUser } from '../../repositories/userRepo';
import { returnUser } from '../../repositories/loginRepo';
import { MethodNotAllowedError, withErrorHandlingAndAuthorization } from '../../middleware/withErrorHandling';
import { logFactory } from '../../utils/logger';
import { ELogEventType } from '../../types/global';

const loginHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) => {
  const { method } = req;
  await updateLastLogin(req.user.id);
  const log = logFactory(req.user);

  if (method !== 'GET') {
    throw new MethodNotAllowedError(req.method);
  }
  log.persist(ELogEventType.LOGIN, 'Successful Login');
  res.status(200).json(req.user);
};

export default withErrorHandlingAndAuthorization(loginHandler, returnUser);
