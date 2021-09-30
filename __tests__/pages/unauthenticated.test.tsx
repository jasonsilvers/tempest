import React from 'react';
import { render } from '../utils/TempestTestUtils';
import Unauthenticated from '../../src/pages/Unauthenticated';
import { useTestUser } from '../utils/mocks/NextMocks';
import { ERole } from '../../src/const/enums';
it('renders the unauthenticated page', async () => {
  const { getByText } = render(<Unauthenticated />);

  expect(getByText(/you do not have access to that page/i)).toBeInTheDocument();
});

it('renders the unauthenticated page with snackbar', async () => {
  useTestUser.mockImplementationOnce(() => ({
    error: 'Houston... theres a... yeah...',
    isLoading: false,
    user: { firstName: 'bob', id: 1, role: { name: ERole.MEMBER, id: 1 } },
  }));
  const { getByText } = render(<Unauthenticated />);

  expect(getByText(/you do not have access to that page/i)).toBeInTheDocument();
});
