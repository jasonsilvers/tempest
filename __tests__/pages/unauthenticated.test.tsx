import React from 'react';
import { render } from '../utils/TempestTestUtils';
import Unauthenticated from '../../src/pages/Unauthenticated';
import { useTestUser } from '../utils/mocks/NextMocks';
import { ERole } from '../../src/types/global';
it('renders the unauthenticated page', async () => {
  const { getByText } = render(<Unauthenticated />);

  expect(getByText(/you must register before you can continue/i)).toBeInTheDocument();
});

it('renders the unauthenticated page with snackbar', async () => {
  useTestUser.mockImplementationOnce(() => ({
    error: 'Houston... theres a... yeah...',
    isLoading: false,
    user: { firstName: 'bob', id: 1, role: { name: ERole.MEMBER, id: 1 } },
  }));
  const { getByText } = render(<Unauthenticated />);

  expect(getByText(/you must register before you can continue/i)).toBeInTheDocument();
  expect(getByText(/There was an error/i)).toBeInTheDocument();
});
