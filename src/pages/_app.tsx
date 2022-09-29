import React, { useEffect } from 'react';
import NavBar from '../components/Navigation/Navbar';
import GlobalStyles from '../styles/GlobalStyles';
import AppProviders from '../components/AppProviders';
import 'twin.macro';
import Head from 'next/head';
import { useNavLoading } from '../hooks/useNavLoading';
import { LoadingOverlay } from '../lib/ui';

function MyApp({ Component, pageProps }) {
  const { navigating } = useNavLoading();

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Cascade</title>
      </Head>
      <AppProviders pageProps={pageProps}>
        <GlobalStyles />
        <div tw="grid grid-cols-12 gap-4 md:ml-28">
          <aside tw="col-span-2">
            <NavBar />
          </aside>
          <main tw="col-span-10 pt-6 m-auto">
            {navigating ? <LoadingOverlay /> : null}
            <Component {...pageProps} />
          </main>
        </div>
      </AppProviders>
    </>
  );
}

export default MyApp;
