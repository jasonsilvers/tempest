import { LogEventType, User } from '@prisma/client';
import prisma from '../prisma/prisma';

const createLog = async (user: User, logEventType: LogEventType, message: string) => {
  await prisma?.logEvent.create({
    data: {
      userId: user.id,
      logEventType,
      message,
    },
  });
};

export { createLog };
