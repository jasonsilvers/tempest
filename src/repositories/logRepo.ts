import { User } from '@prisma/client';
import { ELogEventType } from '../types/global';
import prisma from '../prisma/prisma';

const createLog = async (user: User, logEventType: ELogEventType, message: string) => {
  try {
    console.log(user.id, logEventType, message);
    await prisma?.logEvent.create({
      data: {
        userId: user.id,
        logEventType,
        message,
      },
    });
  } catch (e) {
    console.log('it is failing to log the user');
    console.log(e);
  }
};

export { createLog };
