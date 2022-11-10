import React from 'react';
import 'whatwg-fetch';
import { Logs } from '../../../src/components/Devtools/Logs';
import { ERole, EUri } from '../../../src/const/enums';
import { rest, server } from '../../testutils/mocks/msw';
import { render, waitForLoadingToFinish } from '../../testutils/TempestTestUtils';

// Establish API mocking before tests.
beforeEach(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });

  server.use(
    rest.get(EUri.LOGS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          logEvents: [
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
          ],
        })
      );
    }),
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: '123',
          firstName: 'bob',
          lastName: 'jones',
          role: { id: 22, name: ERole.ADMIN },
        })
      );
    })
  );
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});

// // Clean up after the tests are finished
afterAll(() => server.close());

test('should show logs', async () => {
  const screen = render(<Logs />);
  await waitForLoadingToFinish();
  expect(await screen.findByText(/Successful Login/)).toBeInTheDocument();
});

test('should show logs and not error when name is null ', async () => {
  server.use(
    rest.get(EUri.LOGS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          logEvents: [
            {
              id: 1,
              userId: '51c59467-516d-48f6-92ea-0623137378c0',
              logEventType: 'API_ACCESS',
              createdAt: '2021-10-20T17:19:34.634Z',
              message: 'URI: /api/login Method: GET',
              user: null,
            },
            {
              id: 2,
              userId: null,
              logEventType: 'LOGIN',
              createdAt: '2021-10-20T17:19:35.361Z',
              message: null,
              user: {
                firstName: 'Joe',
                lastName: 'smith',
              },
            },
          ],
        })
      );
    })
  );

  const screen = render(<Logs />);
  expect(await screen.findByText(/joe smith/i)).toBeInTheDocument();
});
