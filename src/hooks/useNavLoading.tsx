import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const useNavLoading = () => {
  const [navigating, setNavigating] = useState(false);
  const router = useRouter();

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

export { useNavLoading };
