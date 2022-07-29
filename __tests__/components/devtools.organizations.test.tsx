import React from 'react';
import 'whatwg-fetch';
import { OrganizationList } from '../../src/components/Devtools/OrganizationList';
import { ERole, EUri } from '../../src/const/enums';
import { rest, server } from '../testutils/mocks/msw';
import { fireEvent, render, userEvent, waitFor, waitForLoadingToFinish } from '../testutils/TempestTestUtils';

beforeEach(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });

  server.use(
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
    }),
    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          organizations: [
            { id: '1', name: '15th Medical group', shortName: '15th mdg', parentId: null },
            { id: '2', name: 'organization 2', shortName: 'org 2', parentId: null },
          ],
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

// // Clean up after the tests are finished.
afterAll(() => server.close());

test('should allow edit organization', async () => {
  const testOrg = { id: '2', name: 'test', shortName: 'org 2', parentId: null };

  server.use(
    rest.put(EUri.ORGANIZATIONS + '2', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ testOrg }));
    })
  );
  const screen = render(<OrganizationList />);

  await waitForLoadingToFinish();

  const organizationCell = await screen.findByRole('cell', {
    name: /organization 2/i,
  });

  fireEvent.doubleClick(organizationCell);

  const input = screen.getAllByRole('textbox');

  fireEvent.change(input[0], { target: { value: test } });

  userEvent.keyboard('{Enter}');

  expect(
    screen.getByRole('cell', {
      name: /test/i,
    })
  ).toBeInTheDocument();

  await waitFor(() => screen.findByRole('alert'));

  fireEvent.doubleClick(organizationCell);

  fireEvent.change(input[0], { target: { value: '' } });

  userEvent.keyboard('{Enter}');

  await waitFor(() => screen.findByRole('alert'));
});
