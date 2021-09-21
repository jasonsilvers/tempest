import { fireEvent, render, waitForElementToBeRemoved, within, waitFor } from '../utils/TempestTestUtils';
import { Devtools } from '../../src/components/Devtools';
import { server, rest } from '../utils/mocks/msw';
import { ERole, EUri } from '../../src/types/global';

import 'whatwg-fetch';

const users = [
  {
    id: '123',
    firstName: 'bob',
    lastName: 'jones',
    organizationId: '1',
    role: { id: 22, name: ERole.ADMIN },
  },
];

const getUsers = (userList = users) =>
  rest.get(EUri.USERS, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        users: userList,
      })
    );
  });

// Establish API mocking before tests.
beforeEach(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });

  server.use(
    getUsers(),
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

    rest.put(`${EUri.USERS}123`, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: '123',
          firstName: 'bob',
          lastName: 'jones',
          organizationId: '2',
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
// // Clean up after the tests are finished.
afterAll(() => server.close());

test('should render devtools', async () => {
  const { getByText, findByRole } = render(<Devtools />);

  const button = await findByRole('button', { name: 'devtool-button' });
  fireEvent.click(button);
  expect(getByText(/loading users/i)).toBeInTheDocument();
});

test('should show list of users', async () => {
  const { getByText, findByRole } = render(<Devtools />);

  const button = await findByRole('button', { name: 'devtool-button' });
  fireEvent.click(button);

  await waitForElementToBeRemoved(() => getByText(/loading users/i));
  expect(getByText(/bob jones/i)).toBeInTheDocument();
});

test('should close devtools', async () => {
  const { getByText, findByRole } = render(<Devtools />);

  const devToolsButton = await findByRole('button', { name: 'devtool-button' });
  fireEvent.click(devToolsButton);

  await waitForElementToBeRemoved(() => getByText(/loading users/i));
  expect(getByText(/bob jones/i)).toBeInTheDocument();
  const closeButton = getByText(/close/i);
  fireEvent.click(closeButton);
  await waitForElementToBeRemoved(() => getByText(/users/i));
});

test('should update a users organization', async () => {
  const { getByText, findByRole, getAllByRole, findByText, queryByText } = render(<Devtools />);

  const button = await findByRole('button', { name: 'devtool-button' });
  fireEvent.click(button);

  await waitForElementToBeRemoved(() => getByText(/loading users/i));

  const user = getByText(/bob jones/i).parentElement;

  const orgSelect = await within(user).findByRole('button', { name: '15th MDG' });

  fireEvent.mouseDown(orgSelect);

  const options = getAllByRole('option');

  server.use(getUsers([{ ...users[0], organizationId: '2' }]));

  fireEvent.click(options[1]);

  // expect the snackbar to be visible
  await waitFor(() => queryByText(/organization changed/i));

  const newOrg = await findByText(/org2/i);

  expect(newOrg).toBeInTheDocument();
});
test('should update a users role', async () => {
  const { getByText, findByRole, getAllByRole, findByText, queryByText } = render(<Devtools />);

  const button = await findByRole('button', { name: 'devtool-button' });
  fireEvent.click(button);

  await waitForElementToBeRemoved(() => getByText(/loading users/i));

  const user = getByText(/bob jones/i).parentElement;

  const roleSelect = await within(user).findByRole('button', { name: /admin/i });

  fireEvent.mouseDown(roleSelect);

  const options = getAllByRole('option');

  server.use(getUsers([{ ...users[0], role: { id: 33, name: ERole.MEMBER } }]));

  fireEvent.click(options[1]);

  await waitFor(() => queryByText(/role changed/i));

  const newRole = await findByText(/member/i);

  expect(newRole).toBeInTheDocument();
});
