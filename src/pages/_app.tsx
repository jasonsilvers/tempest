import React, { useEffect, useState } from 'react';
import NavBar from '../components/Navigation/Navbar';
import GlobalStyles from '../styles/GlobalStyles';
import AppProviders from '../components/AppProviders';
import dynamic from 'next/dynamic';
import tw from 'twin.macro';

const DynamicDevTools = dynamic(
  function importDevTools() {
    return import('../components/Devtools');
  },
  {
    ssr: false,
    loading: function LoadingDevTools() {
      return <div>...loading dev tools</div>;
    },
  }
);

const MainContent = tw.div`ml-80 mt-9`;
function MyApp({ Component, pageProps }) {
  const [showDevTools, setShowDevTools] = useState(true);

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  useEffect(() => {
    // @ts-expect-error
    window.toggleDevtools = () => {
      console.log(showDevTools);
      setShowDevTools((old) => !old);
    };
  });

  return (
    <AppProviders pageProps={pageProps}>
      <GlobalStyles />
      <NavBar />
      <MainContent>
        <Component {...pageProps} />
        {showDevTools ? <DynamicDevTools /> : null}
      </MainContent>
    </AppProviders>
  );
}

export default MyApp;
