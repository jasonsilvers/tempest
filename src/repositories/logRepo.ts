import { Prisma, User } from '@prisma/client';
import { ELogEventType } from '../const/enums';
import prisma from '../prisma/prisma';

const createLog = async (user: User, logEventType: ELogEventType, message: string) => {
  const userId = user ? user.id : null;

  await prisma?.logEvent.create({
    data: {
      userId,
      logEventType,
      message,
    },
  });
};

const getLogs = async () => {
  // select * from logEvent
  return prisma.logEvent.findMany({
    select: {
      id: true,
      message: true,
      logEventType: true,
      createdAt: true,
      user: true,
    },
  });
};

export type LogEventWithUser = Prisma.PromiseReturnType<typeof getLogs>;

export { createLog, getLogs };
