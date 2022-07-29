import dayjs from 'dayjs';
import React from 'react';
import 'whatwg-fetch';
import { Devtools } from '../../src/components/Devtools';
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
    onUnhandledRequest: 'warn',
  });

  server.use(
    getUsers(),
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

// // Clean up after the tests are finished
afterAll(() => server.close());
test('should show list of users', async () => {
  const { getByText } = render(<Devtools />);

  await waitForLoadingToFinish();
  expect(getByText(/bob jones/i)).toBeInTheDocument();
});

test('should update a users organization', async () => {
  const { getByText, getAllByRole, findByText, queryByText } = render(<Users />);

  await waitForLoadingToFinish();

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

  await waitForLoadingToFinish();

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
