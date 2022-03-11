import { UpdateUsersOrg } from '../../src/components/UpdateUsersOrg';
import { ERole, EUri } from '../../src/const/enums';
import { bobJones } from '../testutils/mocks/fixtures';
import { rest, server } from '../testutils/mocks/msw';
import { fireEvent, render, waitFor } from '../testutils/TempestTestUtils';

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
});

beforeEach(() => {
  server.use(
    // return a user with the right permissions
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...bobJones, role: { id: 0, name: ERole.MONITOR } }));
    }),
    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          organizations: [
            { id: 1, name: '15th MDG', parentId: null },
            {
              id: 2,
              name: 'Dental Squadron',
              parentId: 1,
            },
            {
              id: 3,
              name: 'Vaccinations Squadron',
              parentId: 1,
            },
          ],
        })
      );
    }),
    rest.put(`${EUri.USERS}123`, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: '123',
          firstName: 'bob',
          lastName: 'jones',
          organizationId: 2,
          role: { id: 22, name: ERole.MEMBER },
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

test('should update users organization', async () => {
  const { findAllByRole, findByRole, queryByText } = render(<UpdateUsersOrg userId={123} userOrganizationId={1} />);

  const orgSelect = await findByRole('combobox');

  fireEvent.mouseDown(orgSelect);

  const options = await findAllByRole('option');

  server.use(
    // return a user with the right permissions
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          ...bobJones,
          rank: 'ssg',
          role: { id: 0, name: ERole.MONITOR },
          organizationId: 'f41f92d8-3920-4c33-9470-e2c1c6623abb',
        })
      );
    })
  );

  fireEvent.click(options[1]);

  // expect the snackbar to be visible
  await waitFor(() => queryByText(/organization changed/i));
});
