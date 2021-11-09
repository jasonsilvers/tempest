import { NextApiRequest, NextApiResponse } from 'next';
import {
  AppError,
  MethodNotAllowedError,
  NotFoundError,
  PermissionError,
  withErrorHandling,
} from '../../src/middleware/withErrorHandling';
import { testNextApi } from '../testutils/NextAPIUtils';

const mockedPersist = jest.fn();
const mockedTrace = jest.fn();

jest.mock('../../src/lib/logger', () => ({
  logFactory: () => ({
    persist: mockedPersist,
    warn: jest.fn(),
    trace: mockedTrace,
    error: jest.fn(),
  }),
}));

test('should log if API route his hit', async () => {
  // eslint-disable-next-line
  async function testHandler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({ message: 'ok' });
  }

  await testNextApi.get(withErrorHandling(testHandler));

  expect(mockedPersist).toBeCalled();
});

test('should not log if API route his hit when withLogging is false', async () => {
  // eslint-disable-next-line
  async function testHandler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({ message: 'ok' });
  }

  await testNextApi.get(withErrorHandling(testHandler, false));

  expect(mockedPersist).not.toBeCalled();
});

test('should return 404', async () => {
  // eslint-disable-next-line
  async function testHandler(req: NextApiRequest, res: NextApiResponse) {
    throw new NotFoundError();
  }

  const { status, data } = await testNextApi.get(withErrorHandling(testHandler));

  expect(status).toBe(404);
  expect(data).toStrictEqual({ message: 'The requested entity could not be found' });
});

test('should return 403', async () => {
  // eslint-disable-next-line
  async function testHandler(req: NextApiRequest, res: NextApiResponse) {
    throw new PermissionError();
  }

  const { status, data } = await testNextApi.get(withErrorHandling(testHandler));

  expect(status).toBe(403);
  expect(data).toStrictEqual({ message: 'You do not have permission to perform this action' });
});

test('should return 405', async () => {
  // eslint-disable-next-line
  async function testHandler(req: NextApiRequest, res: NextApiResponse) {
    throw new MethodNotAllowedError();
  }

  const { status, data } = await testNextApi.get(withErrorHandling(testHandler));

  expect(status).toBe(405);
  expect(data).toStrictEqual({ message: 'Method Not Found' });
});

test('should return custom status and message', async () => {
  // eslint-disable-next-line
  async function testHandler(req: NextApiRequest, res: NextApiResponse) {
    throw new AppError(201, 'This is a custom message');
  }

  const { status, data } = await testNextApi.get(withErrorHandling(testHandler));

  expect(status).toBe(201);
  expect(data).toStrictEqual({ message: 'This is a custom message' });
});

test('should return 500 as last resort', async () => {
  // eslint-disable-next-line
  async function testHandler(req: NextApiRequest, res: NextApiResponse) {
    throw new Error('This is a custom message');
  }

  const { status, data } = await testNextApi.get(withErrorHandling(testHandler));

  expect(mockedTrace).toBeCalled();

  expect(status).toBe(500);
  expect(data).toStrictEqual({ message: 'There was an internal server error' });
});
