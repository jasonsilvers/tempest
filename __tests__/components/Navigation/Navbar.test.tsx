import React from 'react';
import Navbar from '../../../src/components/Navigation/Navbar';
import { render, waitFor } from '../../utils/TempestTestUtils';
import 'whatwg-fetch';
test('should render a navbar', async () => {
  const { getByText } = render(<Navbar />);
  expect(getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => getByText(/dashboard/i));

  await waitFor(() => getByText(/Tempest/i));

  expect(getByText(/Tempest/i)).toBeInTheDocument;
});

// test('should render a navbar with colored link', async () => {
//   const { getByText } = render(<Navbar />, {
//     user: { firstName: 'Don', lastName: 'Jones' },
//     nextJSRoute: '/Dashboard',
//   });
//   const header = getByText(/Tempest/i);
//   expect(header).toBeInTheDocument;
//   const dashLink = getByText(/dashboard/i);
//   await waitFor(() => expect(dashLink.style.color).toBe('blue'));
// });

test('should not render navbar with no user', async () => {
  const { queryByText } = render(<Navbar />, { user: null });

  await waitFor(() => expect(queryByText(/Tempest/i)).toBeFalsy);
});
