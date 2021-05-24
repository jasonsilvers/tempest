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

it('routes the user to the Profile page if they have the role member', () => {
  useTestUser.mockImplementationOnce(() => ({
    isLoading: true,
    user: { firstName: 'bob', role: { name: ERole.MEMBER, id: 1 } },
  }));
  const push = jest.fn();
  render(<Index />, { push });
  expect(push).toBeCalledTimes(1);
  expect(push).toBeCalledWith('/Profile');
});
