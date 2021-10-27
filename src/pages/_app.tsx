import React, { useEffect, useState } from 'react';
import NavBar from '../components/Navigation/Navbar';
import GlobalStyles from '../styles/GlobalStyles';
import AppProviders from '../components/AppProviders';
import dynamic from 'next/dynamic';
import tw from 'twin.macro';
import Head from 'next/head';
import { useNavLoading } from '../hooks/useNavLoading';
import { ProgressLayout, LoadingSpinner } from '../lib/ui';

const DynamicDevTools = dynamic(
  async function importDevTools() {
    const module = await import('../components/Devtools/index');
    return module.Devtools;
  },
  {
    ssr: false,
    loading: function LoadingDevTools() {
      return <div tw="absolute bottom-5 right-5">...loading dev tools</div>;
    },
  }
);

const MainContent = tw.div`ml-80 mt-9`;

function MyApp({ Component, pageProps }) {
  const [showDevTools, setShowDevTools] = useState(true);
  const { navigating } = useNavLoading();

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  useEffect(() => {
    // @ts-expect-error
    window.toggleDevtools = () => {
      setShowDevTools((old) => !old);
    };
  });

  return (
    <>
      <Head>
        <title>Cascade</title>
      </Head>
      <AppProviders pageProps={pageProps}>
        <GlobalStyles />
        <NavBar />
        <MainContent>
          <Component {...pageProps} />
          {showDevTools ? <DynamicDevTools /> : null}
          {navigating ? (
            <ProgressLayout>
              <LoadingSpinner />
            </ProgressLayout>
          ) : null}
        </MainContent>
      </AppProviders>
    </>
  );
}

export default MyApp;
