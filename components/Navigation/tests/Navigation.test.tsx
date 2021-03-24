import { render } from '../../../__mocks__/TempestTestWrapper';
import { Header, Link } from '../Navigation';

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
test('should render the Link comp with blue colors', () => {
  const { getByText } = render(<Link goToUrl="/Tempest">Tempest</Link>, {
    nextJSRoute: '/Tempest',
  });
  const link = getByText(/Tempest/);

  expect(link);
  expect(link.style.color).toBe('blue');
});
