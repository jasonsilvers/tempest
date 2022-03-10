import seedHandler from '../../../src/pages/api/seed/';
import { testNextApi } from '../../testutils/NextAPIUtils';
import { adminJWT, userJWT } from '../../testutils/mocks/mockJwt';
import { main } from '../../../src/prisma/setupSeed';

jest.mock('../../../src/prisma/setupSeed');
jest.mock('../../../src/prisma/utils');

export class MockPrismaError extends Error {
  readonly code: string;

  constructor(code: string) {
    super('MockPrismaError');
    this.code = code;
  }
}

test('should return 403 if incorrect permisson', async () => {
  const { status, data } = await testNextApi.get(seedHandler, {
    customHeaders: { Authorization: `Bearer ${userJWT}` },
  });

  expect(status).toBe(403);
  expect(data).toStrictEqual({ message: 'You do not have permission to perform this action' });
});

test('should return 405 if wrong method', async () => {
  const { status } = await testNextApi.post(seedHandler, { body: {} });

  expect(status).toBe(405);
});

test('should reset database and run seed', async () => {
  const { status, data } = await testNextApi.get(seedHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ message: 'ok' });
});

test('should throw error if problem with seed', async () => {
  const mockedMain = main as jest.MockedFunction<typeof main>;
  mockedMain.mockImplementation(() => {
    throw new MockPrismaError('P2001');
  });
  const { status, data } = await testNextApi.get(seedHandler, {
    customHeaders: { Authorization: `Bearer ${adminJWT}` },
  });

  expect(status).toBe(500);
  expect(data).toStrictEqual({ message: { code: 'P2001' } });
});
