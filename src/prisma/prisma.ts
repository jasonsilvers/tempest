import { PrismaClient } from '@prisma/client';

// Docs about instantiating `PrismaClient` with Next.js:
// https://pris.ly/d/help/next-js-best-practices

let prisma: PrismaClient | any;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (process.env.NODE_ENV !== 'test') {
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
  } else {
    prisma = jest.fn();
  }
}

export default prisma;
