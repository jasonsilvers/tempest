import { rest } from 'msw';
import React from 'react';
import 'whatwg-fetch';
import { ERole, EUri } from '../../src/const/enums';
import AdminPage from '../../src/pages/Admin';
import { bobJones } from '../testutils/mocks/fixtures';
import { server } from '../testutils/mocks/msw';
import { render, waitForLoadingToFinish } from '../testutils/TempestTestUtils';

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});

beforeEach(() => {
  server.use(
    // return a user with the right permissions
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...bobJones, role: { id: 0, name: ERole.MONITOR } }));
    })
  );
});

afterAll(() => {
  server.close();
  jest.clearAllMocks();
});

afterEach(() => {
  server.resetHandlers();
});

it('should not allow access if not admin', async () => {
  const { getByText } = render(<AdminPage />);

  await waitForLoadingToFinish();

  expect(getByText(/you do not have access/i)).toBeInTheDocument();
});

it('should show admin page', async () => {
  server.use(
    // return a user with the right permissions
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...bobJones, role: { id: 0, name: ERole.ADMIN } }));
    }),
    rest.get(EUri.USERS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          users: [
            {
              id: '123',
              firstName: 'bob',
              lastName: 'jones',
              organizationId: '1',
              role: { id: 22, name: ERole.ADMIN },
            },
          ],
        })
      );
    }),

    rest.get(EUri.ROLES, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          roles: [
            { id: 22, name: ERole.ADMIN },
            { id: 33, name: ERole.MEMBER },
          ],
        })
      );
    }),
    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          organizations: [
            { id: '1', name: '15th MDG', parentId: null },
            { id: '2', name: 'org2', parentId: null },
          ],
        })
      );
    }),

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
    })
  );
  const { getByText } = render(<AdminPage />);

  await waitForLoadingToFinish();

  expect(getByText(/bob jones/i)).toBeInTheDocument();
});
