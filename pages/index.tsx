import Head from 'next/head';
<<<<<<< HEAD
=======

>>>>>>> WIP Mocking Prisma database for writing unit test that handles a user
import React from 'react';
import Link from 'next/link';
import { useUser } from '@tron/nextjs-auth-p1';
import { useRouter } from 'next/router';

function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  if (isLoading) {
    return <div>We are logging you in... please stand by</div>;
  }

  if (!user) {
    router.push('/Unauthenticated');
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

<<<<<<< HEAD
      <main>
=======
      <main >
>>>>>>> WIP Mocking Prisma database for writing unit test that handles a user
        <h1>Tempest</h1>
        <Link href="/Dashboard"> Go to Dashboard </Link>
      </main>
    </div>
  );
}

export default Home;
