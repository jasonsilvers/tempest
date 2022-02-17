import React, { useEffect } from 'react';
import NavBar from '../components/Navigation/Navbar';
import GlobalStyles from '../styles/GlobalStyles';
import AppProviders from '../components/AppProviders';
import tw from 'twin.macro';
import Head from 'next/head';
import { useNavLoading } from '../hooks/useNavLoading';
import { LoadingOverlay } from '../lib/ui';

const MainContent = tw.div`ml-[23rem] mt-9`;

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
        <NavBar />
        <MainContent>
          {navigating ? <LoadingOverlay /> : null}
          <Component {...pageProps} />
        </MainContent>
      </AppProviders>
    </>
  );
}

export default MyApp;
