import { render } from '../utils/TempestTestUtils';
import Index from '../../src/pages/index';
import { useTestUser } from '../utils/mocks/NextMocks';
import { ERole } from '../../src/types/global';

it('routes the user to the Unauthenticated app', async () => {
  const push = jest.fn();
  render(<Index />, { push });
  expect(push).toBeCalledTimes(1);
  expect(push).toBeCalledWith('/Unauthenticated');
});

it('routes the user to the Welcom page if they do not have an organization', () => {
  useTestUser.mockImplementationOnce(() => ({
    isLoading: true,
    user: { firstName: 'bob', id: '1', role: { name: ERole.MEMBER, id: 1 } },
    // eslint-disable-next-line
    refreshUser: () => {},
  }));
  const push = jest.fn();
  render(<Index />, { push });
  expect(push).toBeCalledTimes(1);
  expect(push).toBeCalledWith('/Welcome');
});

it('routes the user to the Profile page if they have the role member', () => {
  useTestUser.mockImplementationOnce(() => ({
    isLoading: true,
    user: { firstName: 'bob', id: '1', role: { name: ERole.MEMBER, id: 1 }, organizationId: 'adioj3' },
    // eslint-disable-next-line
    refreshUser: () => {},
  }));
  const push = jest.fn();
  render(<Index />, { push });
  expect(push).toBeCalledTimes(1);
  expect(push).toBeCalledWith('/Profile/1');
});

it('routes the user to the Dashboard page if their role is not Member', () => {
  useTestUser.mockImplementationOnce(() => ({
    isLoading: true,
    user: { firstName: 'bob', role: { name: ERole.MONITOR, id: 1 }, organizationId: 'aji32' },
    // eslint-disable-next-line
    refreshUser: () => {},
  }));
  const push = jest.fn();
  render(<Index />, { push });
  expect(push).toBeCalledTimes(1);
  expect(push).toBeCalledWith('/Dashboard');
});
