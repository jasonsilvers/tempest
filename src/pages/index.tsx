import Head from 'next/head';
import React from 'react';
import { useUser } from '@tron/nextjs-auth-p1';
import { useRouter } from 'next/router';
import { LoggedInUser } from '../repositories/userRepo';
import { ERole } from '../types/global';

function Home() {
  const { user, isLoading } = useUser<LoggedInUser>();
  const router = useRouter();

  if (!user && !isLoading) {
    router.push('/Unauthenticated');
  }

  if (user && !user.organizationId) {
    router.push('/Welcome');
  }

  if (user && user.role.name === ERole.MEMBER && user.organizationId) {
    router.push(`/Profile/${user.id}`);
  }

  if (user && user.role.name !== ERole.MEMBER && user.organizationId) {
    router.push('/Dashboard');
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div>We are logging you in... please stand by</div>
      </main>
    </div>
  );
}

export default Home;
