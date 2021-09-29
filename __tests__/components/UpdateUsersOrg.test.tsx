import { UpdateUsersOrg } from '../../src/components/UpdateUsersOrg';
import { ERole, EUri } from '../../src/types/global';
import { bobJones } from '../utils/mocks/fixtures';
import { rest, server } from '../utils/mocks/msw';
import { fireEvent, render, waitFor } from '../utils/TempestTestUtils';

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
            { id: 'a2147994-d964-40a9-985b-0f4381828de8', name: '15th MDG', parentId: null },
            {
              id: 'f41f92d8-3920-4c33-9470-e2c1c6623abb',
              name: 'Dental Squadron',
              parentId: 'a2147994-d964-40a9-985b-0f4381828de8',
            },
            {
              id: '67c6657f-0022-48b0-89b3-866dd89831ef',
              name: 'Vaccinations Squadron',
              parentId: 'a2147994-d964-40a9-985b-0f4381828de8',
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
          organizationId: 'f41f92d8-3920-4c33-9470-e2c1c6623abb',
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
  const { findAllByRole, findByRole, queryByText } = render(
    <UpdateUsersOrg userId={'123'} userOrganizationId={'a2147994-d964-40a9-985b-0f4381828de8'} />
  );

  const orgSelect = await findByRole('textbox');

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
