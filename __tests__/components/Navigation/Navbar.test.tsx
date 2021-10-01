import React from 'react';
import Navbar from '../../../src/components/Navigation/Navbar';
import { render, waitFor } from '../../testutils/TempestTestUtils';
import { server } from '../../testutils/mocks/msw';

import 'whatwg-fetch';

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
afterAll(() => {
  jest.resetAllMocks();
  server.close();
});

test('should render a navbar', async () => {
  const { getByText } = render(<Navbar />);

  await waitFor(() => getByText(/my profile/i));

  await waitFor(() => getByText(/Cascade/i));

  expect(getByText(/Cascade/i)).toBeInTheDocument;
});

test('should not render navbar with no user', async () => {
  const { queryByText } = render(<Navbar />);

  await waitFor(() => expect(queryByText(/Cascade/i)).toBeFalsy);
});
