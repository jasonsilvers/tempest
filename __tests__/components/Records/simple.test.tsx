import { User } from '.prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import { render, waitFor } from '../../utils/TempestTestUtils';

const Simple = () => {
  const { user } = useUser<User>();
  return <div>{user?.firstName}</div>;
};

test('should call msw', () => {
  const { getByText } = render(<Simple />);

  waitFor(() => expect(getByText(/bob/i)).toBeInTheDocument());
});
