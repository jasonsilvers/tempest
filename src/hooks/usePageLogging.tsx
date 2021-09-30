import { ELogEventType } from '../const/enums';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { createLog } from '../utils/Api';
import { useUser } from '@tron/nextjs-auth-p1';

const usePageLogging = () => {
  const { route, asPath } = useRouter();
  const { user } = useUser();

  const previousURLRef = useRef('');

  useEffect(() => {
    if (!user) {
      return;
    }

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
