import React, { useEffect } from 'react';
import NavBar from '../components/Navigation/Navbar';
import GlobalStyles from '../styles/GlobalStyles';
import AppProviders from '../components/AppProviders';
import 'twin.macro';
import Head from 'next/head';
import { useNavLoading } from '../hooks/useNavLoading';
import { LoadingOverlay } from '../lib/ui';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const { navigating } = useNavLoading();
  const router = useRouter();

  const showTempestSideBar = router.route.includes('Tempest');

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
        <div tw="grid grid-cols-12 gap-20">
          {showTempestSideBar ? (
            <aside tw="md:col-span-4 lg:col-span-3 col-span-4">
              <NavBar />
            </aside>
          ) : null}
          <main tw="md:col-span-8 lg:col-span-9 col-span-8">
            {navigating ? <LoadingOverlay /> : null}
            <Component {...pageProps} />
          </main>
        </div>
      </AppProviders>
    </>
  );
}

export default MyApp;
