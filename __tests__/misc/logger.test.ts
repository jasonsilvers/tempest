import { LoggedInUser } from '../../src/repositories/userRepo';
import { createLog } from '../../src/repositories/logRepo';
import { ELogEventType } from '../../src/const/enums';

jest.mock('../../src/repositories/logRepo');
jest.spyOn(global.console, 'info');

const user = {
  id: 'test1',
  firstName: 'joe',
  role: { id: 22, name: 'monitor' },
} as LoggedInUser;

test('should add persist method to logger', () => {
  process.env.LOG_LEVEL = 'DEBUG';

  const logger = require('../../src/lib/logger').logFactory;

  const log = logger(user);

  log.persist(ELogEventType.API_ACCESS, 'test');

  expect(createLog).toHaveBeenCalled();
});

test('should return factory function with user attached to logger', () => {
  process.env.LOG_LEVEL = 'DEBUG';

  const logger = require('../../src/lib/logger').logFactory;

  const log = logger(user);

  log.info('test2');

  expect(console.info).toBeCalledWith('User: test1 -- Message:test2');
});
