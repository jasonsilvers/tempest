/// <reference types="next" />
/// <reference types="next/types/global" />

import { Prisma, PrismaClient } from '@prisma/client';

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient;
    }
  }
}
