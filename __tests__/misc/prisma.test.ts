import { PrismaClient } from '@prisma/client';
import prismaImport from '../../src/prisma/prisma';

jest.mock('@prisma/client');

beforeEach(() => {
  jest.resetModules();
});

afterEach(() => {
  jest.clearAllMocks();
});

interface ICustomNodeJsGlobal extends NodeJS.Global {
  prisma: PrismaClient;
}

test('should return new prisma client in production', () => {
  process.env.NODE_ENV = 'production';

  prismaImport.$use = jest.fn();

  const prisma = require('../../src/prisma/prisma');

  expect(prisma).not.toBeNull();

  process.env.NODE_ENV = 'test';
});
test('should return new prisma client if first time being called in dev', () => {
  jest.clearAllMocks();
  process.env.NODE_ENV = 'development';

  require('../../src/prisma/prisma');

  const globalPrisma = (global as unknown as ICustomNodeJsGlobal).prisma;

  expect(globalPrisma).not.toBeNull();
  process.env.NODE_ENV = 'test';
});

test('should return global prisma client if in dev and already created', () => {
  process.env.NODE_ENV = 'development';

  (global as unknown as ICustomNodeJsGlobal).prisma = new PrismaClient();

  const globalPrisma = (global as unknown as ICustomNodeJsGlobal).prisma;

  expect(globalPrisma).not.toBeNull();
  process.env.NODE_ENV = 'test';
});
