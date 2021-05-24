import { Organization, Role, User } from '@prisma/client';
import { UserContextProvider } from '@tron/nextjs-auth-p1/dist/client/UserContextProvider';
import { useTestRouter } from './mocks/NextMocks';
import * as React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

const createTestQueryClient = () => {
  const queryClientInit = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return queryClientInit;
};

type UserWithAll = User & { role?: Partial<Role> } & {
  organization?: Partial<Organization>;
};

interface IWrapperProps {
  user?: Partial<UserWithAll>;
  children?: React.ReactNode;
}

const createWrapper = (queryClient?: QueryClient) => {
  const testQueryClient = createTestQueryClient();

  return function Wrapper(props) {
    return (
      <QueryClientProvider client={queryClient ? queryClient : testQueryClient}>
        <UserContextProvider loginUrl="/api/login">
          {props.children}
        </UserContextProvider>
      </QueryClientProvider>
    );
  };
};

const Wrapper: React.FC<IWrapperProps> = (props) => {
  const testQueryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={testQueryClient}>
      <UserContextProvider user={props.user} loginUrl="/api/login">
        {props.children}
      </UserContextProvider>
    </QueryClientProvider>
  );
};

const render = (
  component: JSX.Element,
  { nextJSRoute = '/', push = jest.fn(), ...options } = {}
) => {
  useTestRouter.mockImplementation(() => ({
    route: nextJSRoute,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    prefetch: async () => {},
    push,
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
export { render, createWrapper, Wrapper, rtlRender, createTestQueryClient };
