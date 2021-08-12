import { LogEventType } from '@prisma/client';
import { log, LogLevelDesc } from './tempestlog';
import { LoggedInUser } from '../../repositories/userRepo';
import prisma from '../../prisma/prisma';

const originalFactory = log.methodFactory;
/*eslint-disable */
const level = (process.env.LOG_LEVEL as LogLevelDesc) || 'info';

//factory that returns a logger with the user
function logFactory(user: LoggedInUser) {
  log.setLevel(level);

  log.persist = async function (logEventType: LogEventType, message: string): Promise<void> {
    await prisma?.logEvent.create({
      data: {
        userId: user.id,
        logEventType,
        message,
      },
    });
  };

  if (level === 'SILENT') {
    return log;
  }

  log.methodFactory = function (methodName, logLevel, logName) {
    const rawMethod = originalFactory(methodName, logLevel, logName);

    return function (message) {
      rawMethod(`User: ${user.id} -- Message:${message}`);
    };
  };

  return log;
}

export { logFactory };
