import { LogEventType } from '@prisma/client';
import log from 'loglevel';
import { LoggedInUser } from '../../repositories/userRepo';

const originalFactory = log.methodFactory;
/*eslint-disable */
const level = (process.env.LOG_LEVEL as any) || log.levels.INFO;

type TempestLog = log.RootLogger & { persist: (message: string, eventType: LogEventType) => void };

//factory that returns a logger with the user
function logFactory(user: LoggedInUser): TempestLog {
  log.methodFactory = function (methodName, logLevel, logName) {
    const rawMethod = originalFactory(methodName, logLevel, logName);

    if (methodName === 'warn') {
      return function (message) {
        rawMethod(`Tempest----For User: ${user.id}-----${message}`);
      };
    }

    return rawMethod;
  };
  log.setLevel(level);

  return log as TempestLog;
}

export { logFactory };
