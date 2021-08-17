import { ELogEventType } from '../types/global';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { createLog } from '../utils/Api';

const usePageLogging = () => {
  const { route, asPath } = useRouter();

  const previousURLRef = useRef('');

  useEffect(() => {
    if (asPath === '/Unauthenticated') {
      createLog(ELogEventType.UNAUTHORIZED, `Unauthorized URL: ${previousURLRef.current}`);
    } else {
      createLog(ELogEventType.PAGE_ACCESS, `URI: ${asPath}`);
    }

    if (asPath !== previousURLRef.current) {
      previousURLRef.current = asPath;
    }
  }, [route]);
};

export { usePageLogging };
