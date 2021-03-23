import { render } from '@testing-library/react';
import { useTestRouter } from '../../../__mocks__/NextMocks';
import { Header, Link } from '../Navigation';

test('should render the Header comp', () => {
  const { getByText } = render(<Header>Tempest</Header>);

  expect(getByText(/Tempest/));
});

test('should render the Link comp', () => {
  useTestRouter.mockImplementationOnce(() => ({
    route: '/Tempest',
  }));

  const { getByText } = render(<Link goToUrl="/">Tempest</Link>);

  expect(getByText(/Tempest/));
});

// we should set this to be equal to the secondary color when styles are a thing
test('should render the Link comp with blue colors', () => {
  useTestRouter.mockImplementationOnce(() => ({
    route: '/Tempest',
  }));

  const { getByText } = render(<Link goToUrl="/Tempest">Tempest</Link>);
  const link = getByText(/Tempest/);

  expect(link);

  console.log(link.style.color);

  expect(link.style.color).toBe('blue');
});
