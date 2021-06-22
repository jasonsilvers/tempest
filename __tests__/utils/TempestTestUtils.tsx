import { UserContextProvider } from '@tron/nextjs-auth-p1/dist/client/UserContextProvider';
import { useTestRouter } from './mocks/NextMocks';
import * as React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SnackbarProvider } from 'notistack';
import { Button } from '../../src/lib/ui';
import { LoggedInUser } from '../../src/repositories/userRepo';

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

interface IWrapperProps {
  user?: Partial<LoggedInUser>;
  children?: React.ReactNode;
}

const notistackRef = React.createRef<SnackbarProvider>();
const onClickDismiss = (key: string) => () => {
  notistackRef.current.closeSnackbar(key);
};

const createWrapper = (queryClient?: QueryClient) => {
  const testQueryClient = createTestQueryClient();

  return function Wrapper(props) {
    return (
      <SnackbarProvider
        maxSnack={3}
        ref={notistackRef}
        action={(key: string) => <Button onClick={onClickDismiss(key)}>Dismiss</Button>}
      >
        <QueryClientProvider client={queryClient ? queryClient : testQueryClient}>
          <UserContextProvider loginUrl="/api/login">{props.children}</UserContextProvider>
        </QueryClientProvider>
      </SnackbarProvider>
    );
  };
};

const Wrapper: React.FC<IWrapperProps> = (props) => {
  const testQueryClient = createTestQueryClient();
  return (
    <SnackbarProvider
      maxSnack={3}
      ref={notistackRef}
      action={(key: string) => <Button onClick={onClickDismiss(key)}>Dismiss</Button>}
    >
      <QueryClientProvider client={testQueryClient}>
        <UserContextProvider user={props.user} loginUrl="/api/login">
          {props.children}
        </UserContextProvider>
      </QueryClientProvider>
    </SnackbarProvider>
  );
};

const render = (component: JSX.Element, { nextJSRoute = '/', push = jest.fn(), ...options } = {}) => {
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
