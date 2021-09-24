import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { logFactory } from '../../../utils/logger';
import { ELogEventType } from '../../../types/global';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import Joi from 'joi';

const logSchema = {
  post: {
    body: Joi.object({
      logEventType: Joi.string().required(),
      message: Joi.string().required(),
    }),
  },
};

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

export default withTempestHandlers(logHandler, findUserByDodId, logSchema, false);
