import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { LoggedInUser } from '../../../repositories/userRepo';
import { returnUser } from '../../../repositories/loginRepo';
import { ApiError, withErrorHandlingAndAuthorization } from '../../../middleware/withErrorHandling';
import { logFactory } from '../../../utils/logger';
import { LogEventType } from '@prisma/client';

type LogHandlerBody = {
  logEventType: LogEventType;
  message: string;
};

const logHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser, LogHandlerBody>, res: NextApiResponse) => {
  const { method, body } = req;

  const log = logFactory(req.user);

  if (method !== 'POST') {
    throw new ApiError({ status: 405, body: 'Method not allowed' });
  }

  log.persist(body.logEventType, body.message);
  res.status(200).json({ message: 'ok' });
};

export default withErrorHandlingAndAuthorization(logHandler, returnUser);
