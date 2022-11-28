import dayjs from 'dayjs';
import React from 'react';
import 'whatwg-fetch';
import { ERole, EUri } from '../../src/const/enums';
import { UserWithAll } from '../../src/repositories/userRepo';
import { rest, server } from '../testutils/mocks/msw';
import { act, fireEvent, render, waitFor, waitForLoadingToFinish, within } from '../testutils/TempestTestUtils';

import { MergeAccount } from '../../src/components/MergeAccount';

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
    onUnhandledRequest: 'warn',
  });

  server.use(
    getUsers(),
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
const setIsOpen = jest.fn();

test('should merge account', async () => {
  const screen = render(<MergeAccount isOpen={true} setIsOpen={() => setIsOpen(true)} />);

  await waitForLoadingToFinish();

  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeInTheDocument();

  expect(within(dialog).getByRole('heading', { name: /merge accounts/i })).toBeInTheDocument();

  const winnerAccountTextBox = screen.getByRole('combobox', {
    name: /winner account/i,
  });
  const loserAccountTextBox = screen.getByRole('combobox', {
    name: /loser account/i,
  });

  const deleteButton = screen.getByRole('button', { name: /merge accounts/i });
  expect(deleteButton).toBeDisabled();

  act(() => {
    winnerAccountTextBox.focus();
    fireEvent.change(document.activeElement, { target: { value: 'sam.member@gmail.com' } });
  });

  fireEvent.keyDown(winnerAccountTextBox, { key: 'ArrowDown' });
  fireEvent.keyDown(winnerAccountTextBox, { key: 'Enter' });

  act(() => {
    loserAccountTextBox.focus();
    fireEvent.change(document.activeElement, { target: { value: 'sam.member2@gmail.com' } });
  });
  fireEvent.keyDown(loserAccountTextBox, { key: 'ArrowDown' });
  fireEvent.keyDown(loserAccountTextBox, { key: 'Enter' });

  const deleteButtonAfter = screen.getByRole('button', { name: /merge accounts/i });
  expect(deleteButtonAfter).not.toBeDisabled();

  const mergeButton = within(dialog).getByTestId('mergeButton');
  expect(mergeButton).toBeInTheDocument();
  fireEvent.click(mergeButton);

  await waitFor(() => screen.findByRole('alert'));
});
