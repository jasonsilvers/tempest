import logHandler from '../../../src/pages/api/logs';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { testNextApi } from '../../testutils/NextAPIUtils';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { getLogs } from '../../../src/repositories/logRepo';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/roleRepo');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/logRepo');

const user = {
  id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  firstName: 'joe',
  role: { id: '22', name: 'monitor' },
};

beforeEach(() => {
  mockMethodAndReturn(findUserByDodId, user);
  mockMethodAndReturn(findGrants, grants);
});

test('Succesfully logs and returns 200', async () => {
  process.env.LOG_LEVEL = 'DEBUG';
  const { status, data } = await testNextApi.post(logHandler, {
    body: {
      logEventType: 'API_ACCESS',
      message: 'Accessed API',
    },
  });

  expect(status).toBe(200);
  expect(data).toEqual({ message: 'ok' });
  process.env.LOG_LEVEL = 'SILENT';
});

test('Post - should return bad request if no body', async () => {
  process.env.LOG_LEVEL = 'DEBUG';
  const { status } = await testNextApi.post(logHandler, {
    body: {},
  });

  expect(status).toBe(400);
  process.env.LOG_LEVEL = 'SILENT';
});

test('Get - should return logs', async () => {
  const logTestData = [
    {
      id: 1,
      userId: '51c59467-516d-48f6-92ea-0623137378c0',
      logEventType: 'API_ACCESS',
      createdAt: '2021-10-20T17:19:34.634Z',
      message: 'URI: /api/login Method: GET',
      user: {
        firstName: 'Joe',
        lastName: 'Smith',
      },
    },
    {
      id: 2,
      userId: '51c59467-516d-48f6-92ea-0623137378c0',
      logEventType: 'LOGIN',
      createdAt: '2021-10-20T17:19:35.361Z',
      message: 'Successful Login',
      user: {
        firstName: 'Joe',
        lastName: 'Smith',
      },
    },
  ];

  mockMethodAndReturn(getLogs, logTestData);

  const { status, data } = await testNextApi.get(logHandler);

  expect(status).toBe(200);
  expect(data).toStrictEqual({ logEvents: logTestData });
});

test('should return method not allowed', async () => {
  const { status } = await testNextApi.delete(logHandler);

  expect(status).toBe(405);
});
