import { PrismaClient } from '@prisma/client';

// Docs about instantiating `PrismaClient` with Next.js:
// https://pris.ly/d/help/next-js-best-practices

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

/* istanbul ignore next */
if (process.env.NODE_ENV === 'production') {
  prisma.$use(async (params, next) => {
    const before = Date.now();

    const result = await next(params);

    const after = Date.now();
    const now = new Date();

    console.log(`${now.toLocaleString('en-US')} - Query ${params.model}.${params.action} took ${after - before}ms`);

    return result;
  });
}

export default prisma;
