import dayjs from 'dayjs';
import React from 'react';
import { UseQueryResult } from 'react-query';
import 'whatwg-fetch';
import { UsersList } from '../../../src/components/ProgramAdmin/UsersList';
import { ERole, EUri } from '../../../src/const/enums';
import { UserWithAll } from '../../../src/repositories/userRepo';
import { rest, server } from '../../testutils/mocks/msw';
import {
  fireEvent,
  render,
  waitFor,
  waitForElementToBeRemoved,
  waitForLoadingToFinish,
} from '../../testutils/TempestTestUtils';
import ProgramAdmin from '../../../src/pages/ProgramAdmin';

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
] as unknown as UserWithAll[];

const detachedUsers = [
  {
    id: 468,
    firstName: 'Jane',
    lastName: 'Anderson',
    organizationId: null,
    reportingOrganizationId: null,
    lastLogin: dayjs().toDate(),
    roleId: 3,
    role: { id: 3, name: ERole.MEMBER },
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

const getDetachedUsers = () =>
  rest.get(`${EUri.USERS}?detached=true`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        users: detachedUsers,
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
  const screen = render(<ProgramAdmin />);

  await waitForLoadingToFinish();

  await waitFor(() => expect(screen.getByText(/jones/i)).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText(/smith/i)).toBeInTheDocument());
});

test('should show list of detached users', async () => {
  server.use(getDetachedUsers());
  const screen = render(<ProgramAdmin />);

  await waitForLoadingToFinish();

  const detachedUsersTab = screen.getByRole('tab', {
    name: /detached users/i,
  });

  fireEvent.click(detachedUsersTab);

  await waitFor(() => expect(screen.getByText(/anderson/i)).toBeInTheDocument());
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
  const screen = render(
    <UsersList
      usersListQuery={{ data: users, isLoading: false } as unknown as UseQueryResult<UserWithAll[], unknown>}
    />
  );

  await waitFor(() => expect(screen.getByText(/jones/i)).toBeInTheDocument());

  fireEvent.click(screen.getByText(/jones/i));

  expect(screen.getByText(/personal/i)).toBeInTheDocument();

  const deleteButton = screen.queryByRole('button', { name: /delete/i });

  expect(deleteButton).not.toBeInTheDocument();
});

test('should update a users organization', async () => {
  const screen = render(<ProgramAdmin />);

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
  const screen = render(<ProgramAdmin />);

  await waitForLoadingToFinish();

  await waitFor(() => expect(screen.getByText(/jones/i)).toBeInTheDocument());

  fireEvent.click(screen.getByText(/jones/i));

  expect(screen.getByText(/personal/i)).toBeInTheDocument();

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

test('should delete user', async () => {
  const screen = render(<ProgramAdmin />);

  await waitForLoadingToFinish();

  await waitFor(() => expect(screen.getByText(/smith/i)).toBeInTheDocument());

  fireEvent.click(screen.getByText(/smith/i));

  expect(screen.getByText(/personal/i)).toBeInTheDocument();

  const deleteButton = await screen.findByRole('button', { name: /delete/i });

  fireEvent.click(deleteButton);

  expect(screen.getByText(/warning/i)).toBeInTheDocument();

  const noButton = await screen.findByRole('button', { name: 'No' });

  fireEvent.click(noButton);

  await waitFor(() => expect(screen.queryByText(/warning/i)).not.toBeInTheDocument());

  server.use(getUsers([users[0]]));
  fireEvent.click(deleteButton);
  fireEvent.click(screen.getByRole('button', { name: /yes/i }));

  await waitFor(() => expect(screen.queryByText(/warning/i)).not.toBeInTheDocument());

  await waitForElementToBeRemoved(() => screen.getByText(/smith, joe/i));
});

test('should detach user', async () => {
  server.use(
    rest.put(`${EUri.USERS}321`, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: 321,
          organizationId: null,
          reportingOrganizationId: null,
        })
      );
    })
  );
  const screen = render(<ProgramAdmin />);

  await waitForLoadingToFinish();

  await waitFor(() => expect(screen.getByText(/smith/i)).toBeInTheDocument());

  fireEvent.click(screen.getByText(/smith/i));

  expect(screen.getByText(/personal/i)).toBeInTheDocument();

  const detachMemberButton = await screen.findByRole('button', { name: /detach member/i });

  server.use(getUsers([users[0]]));
  fireEvent.click(detachMemberButton);

  expect(await screen.findByText(/warning/i)).toBeInTheDocument();
  screen.getByRole('button', { name: /no/i }).click();
  await waitFor(() => expect(screen.queryByText(/warning/i)).not.toBeInTheDocument());

  fireEvent.click(detachMemberButton);

  expect(await screen.findByText(/warning/i)).toBeInTheDocument();

  screen.getByRole('button', { name: /yes/i }).click();

  const alert = await screen.findByText(/user detached/i);

  expect(alert).toBeInTheDocument();

  await waitForElementToBeRemoved(() => screen.getByText(/smith, joe/i));
});
