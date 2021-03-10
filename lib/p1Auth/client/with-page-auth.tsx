/**
 *
 * Function to wrap CRS Components that require Authentication
 *
 * @category Client
 */

import { useEffect } from 'react';
import { WithComponentAuth } from '../server/types/types';
import { useUser } from './UserContextProvider';

export const withPageAuth: WithComponentAuth = <T extends unknown>(
  Component
) => {
  return function withPageAuth(props): JSX.Element {
    const { user, isLoading, isError } = useUser<T>();

    useEffect(() => {
      if (isLoading) return;
      if (!user || isError) {
        window.location.assign('/');
      }
    }, [isLoading, user, isError]);

    if (user) return <Component {...props} />;

    // catch all
    return null;
  };
};
