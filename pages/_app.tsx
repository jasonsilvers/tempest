import "../styles/globals.css";
import React from "react";
import { Hydrate } from "react-query/hydration";
import { QueryClient, QueryClientProvider } from "react-query";
import { AppProps } from "next/app";
import { ReactQueryDevtools } from "react-query/devtools";

export const UserContext = React.createContext({});

function MyApp({ Component, pageProps }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <UserContext.Provider value={{ test: "this is a test" }}>
          <Component {...pageProps} />
        </UserContext.Provider>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default MyApp;
