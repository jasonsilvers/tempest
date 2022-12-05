import { render } from '../testutils/TempestTestUtils';
import AppIndex from '../../src/pages/index';
import TempestIndex from '../../src/pages/Tempest/index';
import { useTestUser } from '../testutils/mocks/NextMocks';
import { ERole } from '../../src/const/enums';
import React from 'react';

it('routes the user to the Unauthenticated app', async () => {
  const push = jest.fn();
  render(<AppIndex />, { push });

  expect(push).toBeCalledTimes(2);
  expect(push).toBeCalledWith('/Unauthenticated');
});

it('routes the user to the Welcom page if they do not have an organization', () => {
  useTestUser.mockImplementationOnce(() => ({
    isLoading: true,
    user: { firstName: 'bob', id: 1, role: { name: ERole.MEMBER, id: 1 } },
    // eslint-disable-next-line
    refreshUser: () => {},
  }));
  const push = jest.fn();
  render(<TempestIndex />, { push });
  expect(push).toBeCalledTimes(1);
  expect(push).toBeCalledWith('/Tempest/Welcome');
});

it('routes the user to the Profile page if they have the role member', () => {
  useTestUser.mockImplementationOnce(() => ({
    isLoading: true,
    user: { firstName: 'bob', id: 1, role: { name: ERole.MEMBER, id: 1 }, organizationId: 323 },
    // eslint-disable-next-line
    refreshUser: () => {},
  }));
  const push = jest.fn();
  render(<TempestIndex />, { push });
  expect(push).toBeCalledTimes(1);
  expect(push).toBeCalledWith('/Tempest/Profile/1');
});

it('routes the user to the Dashboard page if their role is not Member', () => {
  useTestUser.mockImplementationOnce(() => ({
    isLoading: true,
    user: { firstName: 'bob', role: { name: ERole.MONITOR, id: 1 }, organizationId: 323 },
    // eslint-disable-next-line
    refreshUser: () => {},
  }));
  const push = jest.fn();
  render(<TempestIndex />, { push });
  expect(push).toBeCalledTimes(1);
  expect(push).toBeCalledWith('/Tempest/Dashboard');
});
