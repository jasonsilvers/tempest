import { CircularProgress } from '@material-ui/core';
import router from 'next/router';
import { useState, useEffect } from 'react';
import tw from 'twin.macro';

const ProgressLayout = tw.div`absolute top-2 right-2`;

const NavigationLoading = () => {
  return (
    <ProgressLayout>
      <CircularProgress size="24px" color="secondary" />
    </ProgressLayout>
  );
};

const useNavLoading = () => {
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      setNavigating(true);
    };

    const handleRouteComplete = () => {
      setNavigating(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeComplete', handleRouteComplete);
    };
  }, []);

  return { navigating };
};

export { useNavLoading, NavigationLoading };
