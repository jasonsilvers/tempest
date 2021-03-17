import '../styles/globals.css';
import React from 'react';
import { Hydrate } from 'react-query/hydration';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import {
  UserContextProvider,
  useUser,
} from '../lib/p1Auth/client/UserContextProvider'; // auth lib

function MyApp({ Component, pageProps }) {
  const queryClient = new QueryClient();
  const { user } = pageProps;
  // const [user] = useUser()

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <UserContextProvider user={user}>
          <Component {...pageProps} />
        </UserContextProvider>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default MyApp;
