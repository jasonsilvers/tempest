import Head from 'next/head';
import styles from '../styles/Home.module.css';
import React from 'react';
import Link from 'next/link';
import { useUser } from '@tron/nextjs-auth-p1';
import { useRouter } from 'next/router';

function Home(props) {
  const { user, isLoading, error } = useUser();
  const router = useRouter();

  if (isLoading) {
    return <div>We are logging you in... please stand by</div>;
  }

  if (!user) {
    console.warn(error);
    router.push('/Unauthenticated');
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Tempest</h1>
        <Link href="/Dashboard"> Go to Dashboard </Link>
      </main>
    </div>
  );
}

export default Home;
