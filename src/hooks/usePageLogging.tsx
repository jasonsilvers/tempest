import { LogEventType } from '@prisma/client';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { createLog } from '../utils/Api';

const usePageLogging = () => {
  const { route, asPath } = useRouter();

  const previousURLRef = useRef('');

  useEffect(() => {
    if (asPath === '/Unauthenticated') {
      createLog(LogEventType.UNAUTHORIZED, `Unauthorized URL: ${previousURLRef.current}`);
    } else {
      createLog(LogEventType.PAGE_ACCESS, `URI: ${asPath}`);
    }

    if (asPath !== previousURLRef.current) {
      previousURLRef.current = asPath;
    }
  }, [route]);
};

export { usePageLogging };
