import { useUser } from '@tron/nextjs-auth-p1';
import Head from 'next/head';
import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { usePageLogging } from '../hooks/usePageLogging';

const UnauthenticatedApp = () => {
  const { error } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  usePageLogging();

  useEffect(() => {
    if (error) {
      enqueueSnackbar('There was an error getting your account, please contact a system admin', { variant: 'error' });
    }
  }, []);

  return (
    <div>
      <Head>
        <title>Unauthorized</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>You do not have access to that page</h1>
    </div>
  );
};

export default UnauthenticatedApp;
