import { User } from '@prisma/client';
import { UserContextProvider } from '@tron/nextjs-auth-p1/dist/client/UserContextProvider';
import { useTestRouter, useTestUser } from './NextMocks';
import * as React from 'react';
import { render as rtlRender } from '@testing-library/react';

const render = (
  component,
  {
    nextJSRoute = '/',
    isLoading = false,
    error = undefined,
    user = { name: 'test user' } as Partial<User>,
    ...options
  } = {}
) => {
  useTestRouter.mockImplementation(() => ({ route: nextJSRoute }));

  useTestUser.mockImplementationOnce(() => ({
    user,
    isError: false,
    isLoading,
    error,
  }));

  const Wrapper = ({ children }) => (
    <UserContextProvider user={user} loginUrl="/api/login">
      {children}
    </UserContextProvider>
  );
  return rtlRender(component, { wrapper: Wrapper, ...options });
};
export * from '@testing-library/react';
// override React Testing Library's render with our own
export { render };
