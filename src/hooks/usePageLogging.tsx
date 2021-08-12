import { LogEventType } from '@prisma/client';
import axios from 'axios';
import router, { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { EUri } from '../types/global';

const createLog = (logEventType: LogEventType, message: string) => {
  axios.post(EUri.LOGS, {
    logEventType,
    message,
  });
};

const usePageLogging = () => {
  const { route } = useRouter();

  const previousURLRef = useRef('');

  useEffect(() => {
    if (router.asPath === '/Unauthenticated') {
      createLog(LogEventType.UNAUTHORIZED, `Unathorized URL: ${previousURLRef.current}`);
    } else {
      createLog(LogEventType.PAGE_ACCESS, `URL: ${router.asPath}`);
    }

    if (router.asPath !== previousURLRef.current) {
      previousURLRef.current = router.asPath;
    }
  }, [route]);
};

export { usePageLogging };
