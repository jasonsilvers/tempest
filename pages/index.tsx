import Head from "next/head";
import styles from "../styles/Home.module.css";
import React from "react";
import Link from "next/link";
import { useUser } from "@tron/nextjs-auth-p1";

export default function Home(props) {
  const { user, isLoading, isError } = useUser();

  if (isLoading) {
    return <div>We are logging you in... please stand by</div>;
  }

  if (isError) {
    return (
      <div>
        There was an error attempting to log you in please put in a support
        ticket or try refreshing the page
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

const AuthenticatedApp = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Tempest</h1>
        <Link href="/Dashboard"> Login </Link>
      </main>
    </div>
  );
};

const UnauthenticatedApp = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>No User Found</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>You must register before you can continue</h1>
    </div>
  );
};
