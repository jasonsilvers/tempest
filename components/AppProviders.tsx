import React, { useRef } from 'react';
import { Hydrate } from 'react-query/hydration';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { UserContextProvider } from '@tron/nextjs-auth-p1'; // auth lib
import { StylesProvider } from '@material-ui/styles';

function AppProviders({ children, pageProps = null }) {
  //Ensures that data is not shared between different users and requests
  const queryClientRef = useRef<QueryClient | undefined>();

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <StylesProvider injectFirst>
      <QueryClientProvider client={queryClientRef.current}>
        <Hydrate state={pageProps?.dehydratedState}>
          <UserContextProvider user={pageProps?.user}>
            {children}
          </UserContextProvider>
        </Hydrate>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </StylesProvider>
  );
}

export default AppProviders;
