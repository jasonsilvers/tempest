import Head from "next/head";
import React from "react";

const UnauthenticatedApp = (props) => {
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

export default UnauthenticatedApp