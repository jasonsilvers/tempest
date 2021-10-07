import prisma from '../setup/mockedPrisma';
import { createLog } from '../../src/repositories/logRepo';
import { User } from '.prisma/client';
import { ELogEventType } from '../../src/const/enums';

const logEvent = {
  userId: '123',
  legEventType: 'AUTHORIZED',
  message: 'Test log',
};

const user = {
  firstName: 'bob',
} as User;

test('should create log', async () => {
  const spy = prisma.logEvent.create.mockImplementationOnce(() => logEvent);
  await createLog(user, ELogEventType.AUTHORIZED, 'test');
  expect(spy).toBeCalledTimes(1);
});

test('should set user to null if empty', async () => {
  const spy = prisma.logEvent.create.mockImplementationOnce(() => logEvent);
  await createLog(null, ELogEventType.AUTHORIZED, 'test');
  expect(spy).toBeCalledWith({ data: { logEventType: 'AUTHORIZED', message: 'test', userId: null } });
  expect(spy).toBeCalledTimes(1);
});
