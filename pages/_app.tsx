import '../styles/globals.css';
import React from 'react';
import { Hydrate } from 'react-query/hydration';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { UserContextProvider } from '@tron/nextjs-auth-p1'; // auth lib
import NavBar from '../components/Navigation/Navbar';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <pre>{error}</pre>
      <button onClick={resetErrorBoundary}>Please try again</button>
    </div>
  );
}

function MyApp({ Component, pageProps }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <UserContextProvider user={pageProps.user} loginUrl="/api/login">
          <GlobalStyles />
          <NavBar />
          <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {}}>
            <Component {...pageProps} />
          </ErrorBoundary>
        </UserContextProvider>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default MyApp;
