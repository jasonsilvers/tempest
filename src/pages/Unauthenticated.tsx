import { useUser } from '@tron/nextjs-auth-p1';
import Head from 'next/head';
import { useSnackbar } from 'notistack';
import React, { useLayoutEffect } from 'react';

const UnauthenticatedApp = () => {
  const { error } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  useLayoutEffect(() => {
    if (error) {
      enqueueSnackbar('There was an error getting your account, please contact a system admin', { variant: 'error' });
    }
  }, []);

  return (
    <div>
      <Head>
        <title>No User Found</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>You must register before you can continue</h1>
    </div>
  );
};

export default UnauthenticatedApp;
