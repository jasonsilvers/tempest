import React, { useEffect } from 'react';
import NavBar from '../components/Navigation/Navbar';
import GlobalStyles from '../styles/GlobalStyles';
import AppProviders from '../components/AppProviders';
import tw from 'twin.macro';

const MainContent = tw.div`ml-80 mt-9`;
function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <AppProviders pageProps={pageProps}>
      <GlobalStyles />
      <NavBar />
      <MainContent>
        <Component {...pageProps} />
      </MainContent>
    </AppProviders>
  );
}

export default MyApp;
