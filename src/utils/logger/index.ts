import { LogEventType } from '@prisma/client';
import log from 'loglevel';
import prisma from '../../prisma/prisma';
import { LoggedInUser } from '../../repositories/userRepo';

const originalFactory = log.methodFactory;
const level = (process.env.LOG_LEVEL as any) || log.levels.INFO;

type TempestLog = log.RootLogger & { persist: (message: string, eventType: LogEventType) => void };

//factory that returns a logger with the user
function logFactory(user: LoggedInUser): TempestLog {
  log.methodFactory = function (methodName, logLevel, logName) {
    const rawMethod = originalFactory(methodName, logLevel, logName);

    return function (message) {
      rawMethod(`Tempest----For User: ${user.id}-----${message}`);
    };
  };
  log.setLevel(level);

  (log as TempestLog).persist = async (message: string, eventType: LogEventType) => {
    await prisma.log.create({
      data: {
        userId: user.id,
        eventType: eventType,
        details: message,
      },
    });
  };

  return log as TempestLog;
}

export { logFactory };
