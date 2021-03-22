import "../styles/globals.css";
import React from "react";
import { Hydrate } from "react-query/hydration";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { UserContextProvider } from "@tron/nextjs-auth-p1"; // auth lib
import NavBar from "../components/Navigation/Navbar";

function MyApp({ Component, pageProps }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <UserContextProvider user={pageProps.user} loginUrl="/api/login">
          <NavBar />
          <Component {...pageProps} />
        </UserContextProvider>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default MyApp;
