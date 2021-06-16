import React from 'react';
import Navbar from '../../../src/components/Navigation/Navbar';
import { render, waitFor } from '../../utils/TempestTestUtils';
import 'whatwg-fetch';
import { server } from '../../utils/mocks/msw';

// Establish API mocking before tests.
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

test('should render a navbar', async () => {
  const { getByText } = render(<Navbar />);

  await waitFor(() => getByText(/dashboard/i));

  await waitFor(() => getByText(/Tempest/i));

  expect(getByText(/Tempest/i)).toBeInTheDocument;
});

test('should not render navbar with no user', async () => {
  const { queryByText } = render(<Navbar />);

  await waitFor(() => expect(queryByText(/Tempest/i)).toBeFalsy);
});
