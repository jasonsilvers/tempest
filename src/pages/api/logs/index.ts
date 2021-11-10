import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { logFactory } from '../../../lib/logger';
import { ELogEventType } from '../../../const/enums';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import Joi from 'joi';
import { getLogs } from '../../../repositories/logRepo';

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

  switch (method) {
    case 'GET': {
      let logEvents;
      try {
        logEvents = await getLogs();
      } catch (e) {
        console.log(e);
      }
      res.status(200).json({ logEvents });
      break;
    }

    case 'POST': {
      log.persist(body.logEventType, body.message);
      res.status(200).json({ message: 'ok' });
      break;
    }

    default:
      throw new MethodNotAllowedError(method);
  }
};

export default withTempestHandlers(logHandler, findUserByDodId, logSchema, false);
