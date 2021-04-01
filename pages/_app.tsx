import React, { useEffect, useRef } from 'react';
import { Hydrate } from 'react-query/hydration';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { UserContextProvider } from '@tron/nextjs-auth-p1'; // auth lib
import NavBar from '../components/Navigation/Navbar';
import { ErrorBoundary } from 'react-error-boundary';
import GlobalStyles from '../styles/GlobalStyles';
import { StylesProvider } from '@material-ui/styles';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <pre>{error}</pre>
      <button onClick={resetErrorBoundary}>Please try again</button>
    </div>
  );
}

function MyApp({ Component, pageProps }) {
  const queryClientRef = useRef<QueryClient | undefined>();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <StylesProvider injectFirst>
      <QueryClientProvider client={queryClientRef.current}>
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
    </StylesProvider>
  );
}

export default MyApp;
