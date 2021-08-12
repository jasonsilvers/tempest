import Head from 'next/head';
import React from 'react';

const UnauthenticatedApp = () => {
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
