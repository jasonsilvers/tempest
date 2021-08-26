import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { LoggedInUser } from '../../../repositories/userRepo';
import { returnUser } from '../../../repositories/loginRepo';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { logFactory } from '../../../utils/logger';
import { ELogEventType } from '../../../types/global';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';

type LogHandlerBody = {
  logEventType: ELogEventType;
  message: string;
};

const logHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser, LogHandlerBody>, res: NextApiResponse) => {
  const { method, body } = req;

  const log = logFactory(req.user);

  if (method !== 'POST') {
    throw new MethodNotAllowedError(method);
  }

  log.persist(body.logEventType, body.message);
  res.status(200).json({ message: 'ok' });
};

export default withTempestHandlers(logHandler, returnUser, {}, false);
