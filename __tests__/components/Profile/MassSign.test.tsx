import { rest } from 'msw';
import { server } from '../../testutils/mocks/msw';
import { usersQuery } from '../../testutils/mocks/fixtures';
import { fireEvent, render, waitFor } from '../../testutils/TempestTestUtils';
import { MassSign } from '../../../src/components/Dashboard/MassSign';
import React from 'react';

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

test('should show list of users that can be signed', async () => {
  const screen = render(<MassSign usersQuery={usersQuery} />);

  expect(screen.getByText(/edmond adams/i)).toBeInTheDocument();
  expect(screen.getByText(/Keyboard Warrior Training/i)).toBeInTheDocument();
  expect(screen.getByText(/Fire Safety/i)).toBeInTheDocument();
});

test('should filter list of users', async () => {
  const screen = render(<MassSign usersQuery={usersQuery} />);

  expect(screen.getByText(/edmond adams/i)).toBeInTheDocument();
  expect(screen.getByText(/Keyboard Warrior Training/i)).toBeInTheDocument();
  expect(screen.getByText(/Fire Safety/i)).toBeInTheDocument();

  const searchInput = screen.getByRole('textbox');

  fireEvent.change(searchInput, { target: { value: 'admin' } });

  expect(screen.getByText(/joe admin/i)).toBeInTheDocument();
  expect(screen.queryByText(/edmond adams/i)).not.toBeInTheDocument();
});

test('should sign record for user', async () => {
  server.use(
    rest.post('*/21/SIGN_AUTHORITY', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ message: 'ok' }));
    })
  );
  const screen = render(<MassSign usersQuery={usersQuery} />);

  const signButtons = screen.getAllByRole('button');

  fireEvent.click(signButtons[0]);

  await waitFor(() => screen.getByRole('alert'));
});

test('should show snackbar if error signing record', async () => {
  server.use(
    rest.post('*/21/SIGN_AUTHORITY', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'Error' }));
    })
  );
  const screen = render(<MassSign usersQuery={usersQuery} />);

  const signButtons = screen.getAllByRole('button');

  fireEvent.click(signButtons[0]);

  await waitFor(() => screen.getByRole('alert'));
});
