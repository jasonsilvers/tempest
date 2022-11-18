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
