import prisma from '../../src/prisma/prisma';

interface IMockedPrisma {
  user: {
    create: jest.Mock;
    update: jest.Mock;
    findUnique: jest.Mock;
  };
  organization: {
    create: jest.Mock;
    findMany: jest.Mock;
  };
  trackingItem: {
    findMany: jest.Mock;
    delete: jest.Mock;
  };
  logEvent: {
    create: jest.Mock;
  };
}

jest.mock(
  '../../src/prisma/prisma',
  (): IMockedPrisma => ({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    organization: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    trackingItem: {
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    logEvent: {
      create: jest.fn(),
    },
  })
);

export default prisma as unknown as IMockedPrisma;
