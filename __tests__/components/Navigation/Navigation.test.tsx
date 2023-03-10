import { render } from '../../testutils/TempestTestUtils';
import { Header, Link } from '../../../src/components/Navigation/Navigation';

test('should render the Header comp', () => {
  const { getByText } = render(<Header>Tempest</Header>);

  expect(getByText(/Tempest/));
});

test('should render the Link comp', () => {
  const { getByText } = render(<Link goToUrl="/">Tempest</Link>, {
    nextJSRoute: '/Tempest',
  });

  expect(getByText(/Tempest/));
});

// we should set this to be equal to the secondary color when styles are a thing
test('should render the Link comp with white colors', () => {
  const { getByText } = render(<Link goToUrl="/Tempest">Tempest</Link>, {
    nextJSRoute: '/Tempest',
  });
  const link = getByText(/Tempest/);

  expect(link);
});
