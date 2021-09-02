import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { grants } from '../../utils/mocks/fixtures';
import { mockMethodAndReturn } from '../../utils/mocks/repository';
import mattermostHandler from '../../../src/pages/api/mattermost/[id]';
import { sendMessage } from '../../../src/repositories/mattermost/mattermostRepo';
import { testNextApi } from '../../utils/NextAPIUtils';

jest.mock('../../../src/repositories/mattermost/mattermostRepo.ts');
jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');

const globalUserId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

beforeEach(() => {
  mockMethodAndReturn(findUserByDodId, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('Post - should send mattermost message to user', async () => {
  mockMethodAndReturn(sendMessage, { data: 'ok' });

  const { status, data } = await testNextApi.post(mattermostHandler, {
    urlId: 'send',
    body: {},
  });

  expect(sendMessage).toBeCalledWith('@test.user', 'Hello world');

  expect(status).toBe(200);
  expect(data).toStrictEqual({ message: 'ok' });
});

test('Post - should catch error if problem with mattermost call', async () => {
  const mockedSendMessage = sendMessage as jest.MockedFunction<typeof sendMessage>;

  mockedSendMessage.mockImplementation(() => {
    throw new Error('Error making mattermost call');
  });

  const { status, data } = await testNextApi.post(mattermostHandler, {
    urlId: 'send',
    body: {},
  });

  expect(sendMessage).toBeCalledWith('@test.user', 'Hello world');

  expect(status).toBe(500);
  expect(data).toStrictEqual({ message: 'There was an error sending a notification' });
});

test('Post - should return 401 if not authorized', async () => {
  mockMethodAndReturn(sendMessage, { data: 'ok' });

  const { status } = await testNextApi.post(mattermostHandler, {
    body: {},
    urlId: 'send',
    withJwt: false,
  });

  expect(sendMessage).not.toBeCalled();

  expect(status).toBe(401);
});

test('Post - should return 403 if incorrect permissions', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(sendMessage, { data: 'ok' });

  const { status } = await testNextApi.post(mattermostHandler, {
    body: {},
    urlId: 'send',
  });

  expect(sendMessage).not.toBeCalled();
  expect(status).toBe(403);
});

test('Post - should return 400 if incorrect id', async () => {
  mockMethodAndReturn(sendMessage, { data: 'ok' });

  const { status } = await testNextApi.post(mattermostHandler, {
    urlId: 'wrong',
    body: {},
  });

  expect(sendMessage).not.toBeCalled();
  expect(status).toBe(400);
});

test('Post - should return 405 if unsupported method', async () => {
  mockMethodAndReturn(sendMessage, { data: 'ok' });

  const { status } = await testNextApi.get(mattermostHandler, {
    urlId: 'send',
  });

  expect(sendMessage).not.toBeCalled();
  expect(status).toBe(405);
});
