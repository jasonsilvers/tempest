import { rest, server } from '../testutils/mocks/msw';
import { sendMessage } from '../../src/repositories/mattermost/mattermostRepo';

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
  process.env.MATTERMOST_WEBHOOK_KEY = 'testtest';
  process.env.MATTERMOST_API = 'https://chat.test.dso.mil';
  server.use(
    rest.post('https://chat.test.dso.mil/*', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ data: 'ok' }));
    })
  );
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  delete process.env.MATTERMOST_WEBHOOK_KEY;
  delete process.env.MATTERMOST_API;
});

test('should return ok message', async () => {
  const response = await sendMessage('@bob.sanders', 'This is a test message');

  expect(response.data).toStrictEqual({ data: 'ok' });
});
