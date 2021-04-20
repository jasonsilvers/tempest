import React from 'react';
import Navbar from '../../../src/components/Navigation/Navbar';
import { render } from '../../utils/TempestTestUtils';

test('should render a navbar', () => {
  const { getByText } = render(<Navbar />);
  const header = getByText(/Tempest/i);
  expect(header).toBeInTheDocument;
  expect(getByText(/test user/i)).toBeInTheDocument;
});

test('should render a navbar with colored link', () => {
  const { getByText } = render(<Navbar />, {
    user: { firstName: 'Don', lastName: 'Jones' },
    nextJSRoute: '/Dashboard',
  });
  const header = getByText(/Tempest/i);
  expect(header).toBeInTheDocument;
  const dashLink = getByText(/dashboard/i);
  expect(dashLink.style.color).toBe('blue');
  expect(getByText(/Don Jones/i)).toBeInTheDocument;
});

test('should not render navbar with no user', () => {
  const { queryByText } = render(<Navbar />, { user: null });
  expect(queryByText(/Tempest/i)).toBeFalsy;
});
