import log, { LogLevelDesc } from 'loglevel';
import { LoggedInUser } from '../../repositories/userRepo';

const originalFactory = log.methodFactory;
/*eslint-disable */
const level = (process.env.LOG_LEVEL as LogLevelDesc) || 'info';

//factory that returns a logger with the user
function logFactory(user: LoggedInUser) {
  log.setLevel(level);

  if (level === 'SILENT') {
    return log;
  }

  log.methodFactory = function (methodName, logLevel, logName) {
    const rawMethod = originalFactory(methodName, logLevel, logName);

    return function (message) {
      rawMethod(`Tempest__+__User: ${user.id}-----${message}`);
    };
  };

  return log;
}

export { logFactory };
