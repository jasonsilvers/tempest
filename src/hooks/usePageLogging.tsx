import { LogEventType } from '@prisma/client';
import axios from 'axios';
import router from 'next/router';
import { useEffect } from 'react';
import { EUri } from '../types/global';

const createLog = (logEventType: LogEventType, message: string) => {
  axios.post(EUri.LOGS, {
    logEventType,
    message,
  });
};

const usePageLogging = () => {
  useEffect(() => {
    const handleRouteComplete = () => {
      createLog(LogEventType.PAGE_ACCESS, `URL: ${router.asPath}`);
    };

    router.events.on('routeChangeComplete', handleRouteComplete);

    return () => {
      router.events.off('routeChangeComplete', handleRouteComplete);
    };
  }, []);
};

export { usePageLogging };
