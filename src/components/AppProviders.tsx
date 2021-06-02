import React, { useRef } from 'react';
import { Hydrate } from 'react-query/hydration';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { UserContextProvider } from '@tron/nextjs-auth-p1'; // auth lib
import { StylesProvider } from '@material-ui/styles';
import { SnackbarProvider } from 'notistack';
import { Button } from '../lib/ui';

const notistackRef = React.createRef<SnackbarProvider>();
const onClickDismiss = (key: string) => () => {
  notistackRef.current.closeSnackbar(key);
};

function AppProviders({ children, pageProps = null }) {
  //Ensures that data is not shared between different users and requests
  const queryClientRef = useRef<QueryClient | undefined>();

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <StylesProvider injectFirst>
      <SnackbarProvider
        maxSnack={3}
        ref={notistackRef}
        action={(key: string) => <Button onClick={onClickDismiss(key)}>Dismiss</Button>}
      >
        <QueryClientProvider client={queryClientRef.current}>
          <Hydrate state={pageProps?.dehydratedState}>
            <UserContextProvider user={pageProps?.user}>{children}</UserContextProvider>
          </Hydrate>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </SnackbarProvider>
    </StylesProvider>
  );
}

export default AppProviders;
