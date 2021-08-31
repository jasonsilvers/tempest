import { User } from '@prisma/client';
import { ELogEventType } from '../types/global';
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

export { createLog };
