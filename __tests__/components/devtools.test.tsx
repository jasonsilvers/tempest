import dayjs from 'dayjs';
import 'whatwg-fetch';
import { Devtools } from '../../src/components/Devtools';
import { Logs } from '../../src/components/Devtools/Logs';
import { OrganizationList } from '../../src/components/Devtools/OrganizationList';
import { Users } from '../../src/components/Devtools/Users';
import { ERole, EUri } from '../../src/const/enums';
import { rest, server } from '../testutils/mocks/msw';
import {
  fireEvent,
  render,
  waitFor,
  waitForElementToBeRemoved,
  waitForLoadingToFinish,
  within,
} from '../testutils/TempestTestUtils';

const users = [
  {
    id: '123',
    firstName: 'bob',
    lastName: 'jones',
    organizationId: '1',
    lastLogin: dayjs().toDate(),
    role: { id: 22, name: ERole.ADMIN },
  },
  {
    id: '321',
    firstName: 'Joe',
    lastName: 'Smith',
    organizationId: '1',
    role: { id: 22, name: ERole.MEMBER },
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
    onUnhandledRequest: 'error',
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
            { id: '1', name: '15th Medical group', shortName: '15th mdg', parentId: null },
            { id: '2', name: 'organization 2', shortName: 'org 2', parentId: null },
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
test('should show list of users', async () => {
  const { getByText } = render(<Devtools />);

  await waitForElementToBeRemoved(() => getByText(/loading users/i));
  expect(getByText(/bob jones/i)).toBeInTheDocument();
});

test('should update a users organization', async () => {
  const { getByText, getAllByRole, findByText, queryByText } = render(<Users />);

  await waitForElementToBeRemoved(() => getByText(/loading users/i));

  const user = getByText(/bob jones/i).parentElement;

  const orgSelect = await within(user).findByRole('button', { name: /15th mdg/i });

  fireEvent.mouseDown(orgSelect);

  const options = getAllByRole('option');

  server.use(getUsers([{ ...users[0], organizationId: '2' }]));

  fireEvent.click(options[1]);

  // expect the snackbar to be visible
  await waitFor(() => queryByText(/organization changed/i));

  const newOrg = await findByText(/org 2/i);

  expect(newOrg).toBeInTheDocument();
});
test('should update a users role', async () => {
  const { getByText, getAllByRole, findByText, queryByText } = render(<Users />);

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

test('should delete user', async () => {
  const { getByText, getByRole, queryByText } = render(<Users />);

  await waitForLoadingToFinish();

  const user = getByText(/bob jones/i).parentElement;

  expect(user).toBeInTheDocument();

  const deleteButton = getByRole('button', { name: /delete/i });

  fireEvent.click(deleteButton);

  expect(getByText(/warning/i)).toBeInTheDocument();

  fireEvent.click(getByRole('button', { name: /no/i }));

  expect(queryByText('warning')).not.toBeInTheDocument();

  fireEvent.click(deleteButton);
  fireEvent.click(getByRole('button', { name: /yes/i }));

  server.use(
    getUsers([users[0]]),
    rest.delete(EUri.USERS + '*', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ message: 'ok' }));
    })
  );

  await waitForElementToBeRemoved(() => getByText(/joe/i));
});

test('should show logs', async () => {
  const screen = render(<Logs />);

  await waitForLoadingToFinish();

  expect(screen.getByText(/Successful Login/)).toBeInTheDocument();
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

  const { getByText } = render(<Logs />);

  await waitForLoadingToFinish();

  expect(getByText(/joe smith/i)).toBeInTheDocument();
});

test('should show organizations', async () => {
  const screen = render(<OrganizationList />);

  expect(await screen.findByText(/15th mdg/i)).toBeInTheDocument();
});

test('should delete a organization', async () => {
  server.use(
    rest.delete(EUri.ORGANIZATIONS + '2', (req, res, context) => {
      return res(context.status(200), context.json({ message: 'ok' }));
    })
  );

  const screen = render(<OrganizationList />);

  expect(await screen.findByText(/15th mdg/i)).toBeInTheDocument();

  const row = screen.getByRole('row', {
    name: /organization 2/i,
  });

  server.use(
    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          organizations: [{ id: '1', name: '15th Medical group', shortName: '15th mdg', parentId: null }],
        })
      );
    })
  );

  const deleteButton = within(row).getByTestId('DeleteIcon');

  fireEvent.click(deleteButton);

  await waitFor(() => screen.findByText(/organization deleted/i));
});

test('should not be able to delete org with children or users', async () => {
  server.use(
    rest.delete(EUri.ORGANIZATIONS + '2', (req, res, context) => {
      return res(context.status(409), context.json({ message: 'Unable to delete org' }));
    })
  );

  const screen = render(<OrganizationList />);

  const row = await screen.findByRole('row', {
    name: /organization 2/i,
  });

  const deleteButton = within(row).getByTestId('DeleteIcon');

  fireEvent.click(deleteButton);

  await waitFor(() => screen.findByRole('alert'));
});

test('should add new organization', async () => {
  server.use(
    rest.post(EUri.ORGANIZATIONS, (req, res, context) => {
      return res(context.status(200), context.json(req.body));
    })
  );

  const screen = render(<OrganizationList />);

  const addIcon = await screen.findByTestId('AddIcon');

  fireEvent.click(addIcon);

  const closeIcon = screen.getByRole('button', {
    name: /dialog-close-button/i,
  });

  fireEvent.click(closeIcon);

  fireEvent.click(addIcon);

  const nameInput = screen.getByRole('textbox', {
    name: /name-input/i,
  });

  const shortNameInput = screen.getByRole('textbox', {
    name: /shortname/i,
  });

  const createButton = screen.getByRole('button', {
    name: /create/i,
  });

  fireEvent.click(createButton);

  expect(await screen.findByText(/"name" is not allowed to be empty/i)).toBeInTheDocument();
  expect(await screen.findByText(/"shortName" is not allowed to be empty/i)).toBeInTheDocument();

  fireEvent.change(nameInput, { target: { value: 'Test organization' } });
  fireEvent.change(shortNameInput, { target: { value: 'Test org' } });

  const orgSelect = screen.getByRole('button', {
    name: /none/i,
  });

  fireEvent.mouseDown(orgSelect);

  const option = screen.getByRole('option', {
    name: /organization 2/i,
  });

  server.use(
    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          organizations: [
            { id: '1', name: '15th Medical group', shortName: '15th mdg', parentId: null },
            { id: '2', name: 'organization 2', shortName: 'org 2', parentId: null },
            { id: '3', name: 'Test organization', shortName: 'Test org', parentId: 2 },
          ],
        })
      );
    })
  );

  fireEvent.click(option);

  fireEvent.click(createButton);

  await waitFor(() => screen.findByRole('alert'));
});
