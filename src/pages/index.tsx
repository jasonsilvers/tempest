import Head from 'next/head';
import React from 'react';
import { useUser } from '@tron/nextjs-auth-p1';
import { useRouter } from 'next/router';
import { LoggedInUser } from '../repositories/userRepo';
import { ERole } from '../const/enums';

import 'twin.macro';
import { AuthenticatingApp } from '../components/AuthenticatingApp';
import { useQueryClient } from 'react-query';
import { fetchMemberTrackingItems } from '../hooks/api/users';
import { mtiQueryKeys } from '../hooks/api/memberTrackingItem';

function Home() {
  const { user, isLoading } = useUser<LoggedInUser>();
  const queryClient = useQueryClient();
  const router = useRouter();

  if (!user && !isLoading) {
    router.push('/Unauthenticated');
  }

  if (user && !user.organizationId) {
    router.push('/Welcome');
  }

  if (user && user.role?.name === ERole.MEMBER && user.organizationId) {
    queryClient.prefetchQuery(mtiQueryKeys.memberTrackingItems(user.id), () => fetchMemberTrackingItems(user.id));
    router.push(`/Profile/${user.id}`);
  }

  if (user && user.role?.name !== ERole.MEMBER && user.organizationId) {
    router.push('/Dashboard');
  }

  return (
    <div>
      <Head>
        <title>Cascade</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isLoading ? <AuthenticatingApp /> : null}
    </div>
  );
}

export default Home;
