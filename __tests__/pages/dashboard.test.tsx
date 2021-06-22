import Dashboard from '../../src/pages/Dashboard';
import { render } from '../utils/TempestTestUtils';
it('renders the Dashboard page', async () => {
  const { getByText } = render(<Dashboard />);

  expect(getByText(/Dashboard/i)).toBeInTheDocument();
});
