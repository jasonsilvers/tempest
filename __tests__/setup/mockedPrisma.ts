import prisma from '../../src/prisma/prisma';

interface IMockedPrisma {
  $queryRaw: jest.Mock;
  role: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
  };
  user: {
    create: jest.Mock;
    update: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
  organization: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
  };
  trackingItem: {
    findMany: jest.Mock;
    delete: jest.Mock;
    create: jest.Mock;
  };
  logEvent: {
    create: jest.Mock;
    findMany: jest.Mock;
  };
  grant: {
    findMany: jest.Mock;
  };
  memberTrackingItem: {
    findUnique: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
    update: jest.Mock;
  };
  memberTrackingRecord: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
  };
}

jest.mock(
  '../../src/prisma/prisma',
  (): IMockedPrisma => ({
    $queryRaw: jest.fn(),
    role: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    organization: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    trackingItem: {
      findMany: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    logEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    grant: {
      findMany: jest.fn(),
    },
    memberTrackingItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    memberTrackingRecord: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  })
);

export default prisma as unknown as IMockedPrisma;
