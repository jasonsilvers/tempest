import { useSnackbar } from 'notistack';
import React, { useRef } from 'react';
import { QueryClient, QueryCache, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Hydrate } from 'react-query/hydration';

function QueryProvider({ children, pageProps = null, queryClientOptions = {} }) {
  //Ensures that data is not shared between different users and requests

  const queryClientRef = useRef<QueryClient | undefined>();
  const { enqueueSnackbar } = useSnackbar();

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      ...queryClientOptions,
      queryCache: new QueryCache({
        onError: (_, query) => enqueueSnackbar(`Error retrieving ${query.queryKey[0]}`, { variant: 'error' }),
      }),
    });
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <Hydrate state={pageProps?.dehydratedState}>{children}</Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export { QueryProvider };
