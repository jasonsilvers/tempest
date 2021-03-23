import React from 'react';
import { render } from '@testing-library/react';
import Navbar from '../Navbar';

import { useTestRouter, useTestUser } from '../../../__mocks__/NextMocks';

test('should render a navbar', () => {
  useTestUser.mockImplementationOnce(() => ({
    user: { name: 'test user' },
    isError: false,
    isLoading: false,
  }));
  useTestRouter.mockImplementation(() => ({
    route: '/',
  }));
  const { getByText } = render(<Navbar />);
  const header = getByText(/Tempest/i);
  expect(header).toBeInTheDocument;

  expect(getByText(/test user/i)).toBeInTheDocument;
});
