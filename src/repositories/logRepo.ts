import { User } from '@prisma/client';
import { ELogEventType } from '../types/global';
import prisma from '../prisma/prisma';

const createLog = async (user: User, logEventType: ELogEventType, message: string) => {
  await prisma?.logEvent.create({
    data: {
      userId: user.id,
      logEventType,
      message,
    },
  });
};

export { createLog };
