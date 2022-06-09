import { UserContextProvider } from '@tron/nextjs-auth-p1/dist/client/UserContextProvider';
import { useTestRouter } from './mocks/NextMocks';
import * as React from 'react';
import { render as rtlRender, waitForElementToBeRemoved, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SnackbarProvider } from 'notistack';
import { LoggedInUser } from '../../src/repositories/userRepo';
import userEvent from '@testing-library/user-event';
import { EUri } from '../../src/const/enums';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDayjs';
import { StyledEngineProvider, ThemeProvider, createTheme } from '@mui/material/styles';
import { Button } from '@mui/material';

export const waitForLoadingToFinish = () =>
  waitForElementToBeRemoved(
    () => [
      ...screen.queryAllByLabelText(/loading/i),
      ...screen.queryAllByText(/loading/i),
      ...screen.queryAllByRole('progressbar'),
    ],
    {
      timeout: 4000,
    }
  );

const theme = createTheme({
  palette: {
    primary: {
      main: '#2D2270',
    },
    secondary: {
      main: '#6A5CBE',
    },
  },
});

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
      <ThemeProvider theme={theme}>
        <StyledEngineProvider injectFirst>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <SnackbarProvider
              maxSnack={3}
              ref={notistackRef}
              action={(key: string) => <Button onClick={onClickDismiss(key)}>Dismiss</Button>}
            >
              <QueryClientProvider client={queryClient ? queryClient : testQueryClient}>
                <UserContextProvider loginUrl={EUri.LOGIN}>{props.children}</UserContextProvider>
              </QueryClientProvider>
            </SnackbarProvider>
          </LocalizationProvider>
        </StyledEngineProvider>
      </ThemeProvider>
    );
  };
};

const Wrapper: React.FC<IWrapperProps> = (props) => {
  const testQueryClient = createTestQueryClient();
  return (
    <ThemeProvider theme={theme}>
      <StyledEngineProvider injectFirst>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SnackbarProvider
            maxSnack={3}
            ref={notistackRef}
            action={(key: string) => <Button onClick={onClickDismiss(key)}>Dismiss</Button>}
          >
            <QueryClientProvider client={testQueryClient}>
              <UserContextProvider user={props.user} loginUrl={EUri.LOGIN}>
                {props.children}
              </UserContextProvider>
            </QueryClientProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </StyledEngineProvider>
    </ThemeProvider>
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
export { render, createWrapper, Wrapper, rtlRender, createTestQueryClient, userEvent };
