import React from 'react';
import Navbar from '../../../src/components/Navigation/Navbar';
import { render, waitFor } from '../../utils/TempestTestUtils';
import 'whatwg-fetch';
test('should render a navbar', async () => {
  const { getByText } = render(<Navbar />);

  await waitFor(() => getByText(/dashboard/i));

  await waitFor(() => getByText(/Tempest/i));

  expect(getByText(/Tempest/i)).toBeInTheDocument;
});

test('should not render navbar with no user', async () => {
  const { queryByText } = render(<Navbar />, { user: null });

  await waitFor(() => expect(queryByText(/Tempest/i)).toBeFalsy);
});
