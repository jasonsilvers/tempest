import dayjs from 'dayjs';
import React from 'react';
import { UseQueryResult } from 'react-query';
import 'whatwg-fetch';

import { ERole, EUri } from '../../src/const/enums';
import { UserWithAll } from '../../src/repositories/userRepo';
import { rest, server } from '../testutils/mocks/msw';
import {
  fireEvent,
  render,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  waitForLoadingToFinish,
  within,
} from '../testutils/TempestTestUtils';
import { AdminUsersList } from '../../src/components/Devtools/AdminUsersList';

const users = [
  {
    id: '123',
    firstName: 'bob',
    lastName: 'jones',
    organizationId: '1',
    reportingOrganizationId: 2,
    lastLogin: dayjs().toDate(),
    roleId: 1,
    role: { id: 1, name: ERole.MONITOR },
  },
  {
    id: '321',
    firstName: 'Joe',
    lastName: 'Smith',
    organizationId: '1',
    roleId: 1,
    role: { id: 1, name: ERole.MONITOR },
  },
  {
    id: '4',
    firstName: 'Sam,',
    lastName: 'Member',
    organizationId: '1',
    email: 'sam.member@gmail.com',
    roleId: 2,
    role: { id: 2, name: ERole.MEMBER },
  },
  {
    id: '5',
    firstName: 'Sam',
    lastName: 'Member',
    organizationId: '1',
    email: 'sam.member2@gmail.com',
    roleId: 2,
    role: { id: 2, name: ERole.MEMBER },
  },
] as unknown as UserWithAll[];

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

    rest.delete(`${EUri.USERS}321`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ message: 'ok' }));
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
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: '123',
          firstName: 'frank',
          lastName: 'sanders',
          role: { id: 4, name: ERole.ADMIN },
        })
      );
    }),

    rest.put(`${EUri.USERS}321`, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: 321,
          organizationId: 2,
          reportingOrganizationId: 2,
          roleId: 2,
        })
      );
    }),
    rest.put(`${EUri.USERS}123`, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: 321,
          organizationId: 2,
          reportingOrganizationId: 2,
          roleId: 2,
        })
      );
    }),
    rest.get(EUri.ROLES, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          roles: [
            { id: 1, name: ERole.MONITOR },
            { id: 2, name: ERole.PROGRAM_MANAGER },
            { id: 3, name: ERole.MEMBER },
          ],
        })
      );
    }),
    rest.post(EUri.MERGE, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ message: 'ok' }));
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

const UsersList = () => {
  return (
    <AdminUsersList
      usersListQuery={{ data: users, isLoading: false } as unknown as UseQueryResult<UserWithAll[], unknown>}
    />
  );
};

test('should show list of users', async () => {
  const screen = render(<UsersList />);

  await waitForLoadingToFinish();

  await waitFor(() => expect(screen.getByText(/jones/i)).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText(/smith/i)).toBeInTheDocument());
});

test('should not show delete button if not admin', async () => {
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: '123',
          firstName: 'frank',
          lastName: 'sanders',
          role: { id: 4, name: ERole.PROGRAM_MANAGER },
        })
      );
    })
  );
  const screen = render(<UsersList />);

  await waitFor(() => expect(screen.getByText(/jones/i)).toBeInTheDocument());

  fireEvent.click(screen.getByText(/jones/i));

  expect(screen.getByText(/personal/i)).toBeInTheDocument();

  const deleteButton = screen.queryByRole('button', { name: /delete/i });

  expect(deleteButton).not.toBeInTheDocument();
});

test('should update a users organization', async () => {
  const screen = render(<UsersList />);

  await waitForLoadingToFinish();

  await waitFor(() => expect(screen.getByText(/jones/i)).toBeInTheDocument());

  fireEvent.click(screen.getByText(/jones/i));

  expect(screen.getByText(/personal/i)).toBeInTheDocument();

  const orgDropDown = await screen.findByRole('button', { name: /select-org/i });

  fireEvent.mouseDown(orgDropDown);

  const options = screen.getAllByRole('option');

  server.use(getUsers([{ ...users[0], organizationId: 2 }]));

  fireEvent.click(options[0]);

  const updateButton = screen.getByRole('button', {
    name: /update/i,
  });

  expect(updateButton).not.toBeDisabled();

  fireEvent.click(updateButton);

  const alert = await screen.findByText(/user updated/i);
  expect(alert).toBeInTheDocument();
});

test('should update a users role', async () => {
  const screen = render(<UsersList />);

  await waitForLoadingToFinish();

  await waitFor(() => expect(screen.getByText(/jones/i)).toBeInTheDocument());

  fireEvent.click(screen.getByText(/jones/i));

  expect(screen.getByText(/personal/i)).toBeInTheDocument();

  await waitForElementToBeRemoved(screen.getByText(/..loading roles/i));

  const roleDropDown = await screen.findByRole('button', { name: /select-roles/i });

  fireEvent.mouseDown(roleDropDown);

  const options = await screen.findAllByRole('option');

  server.use(getUsers([{ ...users[1], role: { id: 3, name: ERole.MEMBER } }]));

  fireEvent.click(options[2]);

  const updateButton = screen.getByRole('button', {
    name: /update/i,
  });

  fireEvent.click(updateButton);

  const alert = await screen.findByText(/user updated/i);

  expect(alert).toBeInTheDocument();
});

test('should merge account', async () => {
  const screen = render(<UsersList />);

  await waitForLoadingToFinish();
  const openMergeDialogButton = screen.getByRole('button', { name: /merge/i });
  expect(openMergeDialogButton).toBeInTheDocument();

  fireEvent.click(openMergeDialogButton);
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeInTheDocument();

  userEvent.keyboard('{Escape}');

  fireEvent.click(openMergeDialogButton);

  expect(within(dialog).getByText(/merge account/i)).toBeInTheDocument();

  const comboBoxes = within(dialog).getAllByRole('combobox');
  const winnerAccountTextBox = comboBoxes[0];
  const loserAccountTextBox = comboBoxes[1];

  
  fireEvent.change(winnerAccountTextBox, { target: 'sam.member@gmail.com' });
  fireEvent.keyDown(winnerAccountTextBox, { key: 'ArrowDown' });
  fireEvent.keyDown(winnerAccountTextBox, { key: 'Enter' });

 
  fireEvent.change(loserAccountTextBox, { target: 'sam.member2@gmail.com' });
  fireEvent.keyDown(loserAccountTextBox, { key: 'ArrowDown' });
  fireEvent.keyDown(loserAccountTextBox, { key: 'Enter' });

  const mergeButton = within(dialog).getByTestId('mergeButton');
  expect(mergeButton).toBeInTheDocument();
  fireEvent.click(mergeButton);
  await waitFor(() => screen.findByRole('alert'));
});
