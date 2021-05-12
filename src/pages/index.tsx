import Head from 'next/head';
import React from 'react';
import Link from 'next/link';
import { useUser } from '@tron/nextjs-auth-p1';
import { useRouter } from 'next/router';
import Button from '@material-ui/core/Button';
import tw from 'twin.macro';

const TempestButton = tw(Button)`bg-purple-300`;

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

      <main>
        <h1>Tempest</h1>
        <Link href="/Dashboard"> Go to Dashboard </Link>
        <TempestButton>Test</TempestButton>
      </main>
    </div>
  );
}

export default Home;
