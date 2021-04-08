import { Organization, Role, User } from '@prisma/client';
import { UserContextProvider } from '@tron/nextjs-auth-p1/dist/client/UserContextProvider';
import { useTestRouter, useTestUser } from './mocks/NextMocks';
import * as React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClientInit = new QueryClient();

type UserWithAll = User & { role?: Partial<Role> } & {
  organization?: Partial<Organization>;
};

interface IWrapperProps {
  user?: Partial<UserWithAll>;
  children?: React.ReactNode;
}

const Wrapper: React.FC<IWrapperProps> = (props) => {
  return (
    <QueryClientProvider client={queryClientInit}>
      <UserContextProvider user={props.user} loginUrl="/api/login">
        {props.children}
      </UserContextProvider>
    </QueryClientProvider>
  );
};

const render = (
  component: JSX.Element,
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

  return rtlRender(component, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
    ...options,
  });
};

export * from '@testing-library/react';
// override React Testing Library's render with our own
export { render, Wrapper, queryClientInit };
