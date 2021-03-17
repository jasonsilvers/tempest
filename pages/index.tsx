import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Navbar from '../components/Navigation/Navbar';
import React from 'react';
import Link from 'next/link';

export default function Home(props) {
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
}
