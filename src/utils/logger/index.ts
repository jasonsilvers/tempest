import { ELogEventType } from '../../const/enums';
import { log, LogLevelDesc } from './tempestlog';
import { LoggedInUser } from '../../repositories/userRepo';
import { createLog } from '../../repositories/logRepo';

const originalFactory = log.methodFactory;
/*eslint-disable */
const level = (process.env.LOG_LEVEL as LogLevelDesc) || 'info';

const noop = () => {
  return undefined;
};

//factory that returns a logger with the user
function logFactory(user: LoggedInUser) {
  log.setLevel(level);

  log.persist = noop;
  if (level === 'SILENT') {
    return log;
  }

  log.persist = async function (logEventType: ELogEventType, message: string): Promise<void> {
    createLog(user, logEventType, message);
  };

  log.methodFactory = function (methodName, logLevel, logName) {
    const rawMethod = originalFactory(methodName, logLevel, logName);
    return function (message) {
      rawMethod(`User: ${user?.id} -- Message:${message}`);
    };
  };

  return log;
}

export { logFactory };
