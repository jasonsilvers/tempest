import { LogEventType } from '@prisma/client';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { EUri } from '../types/global';

const createLog = (logEventType: LogEventType, message: string) => {
  axios.post(EUri.LOGS, {
    logEventType,
    message,
  });
};

const usePageLogging = () => {
  const { route, asPath } = useRouter();

  const previousURLRef = useRef('');

  useEffect(() => {
    if (asPath === '/Unauthenticated') {
      createLog(LogEventType.UNAUTHORIZED, `Unathorized URL: ${previousURLRef.current}`);
    } else {
      createLog(LogEventType.PAGE_ACCESS, `URL: ${asPath}`);
    }

    if (asPath !== previousURLRef.current) {
      previousURLRef.current = asPath;
    }
  }, [route]);
};

export { usePageLogging };
