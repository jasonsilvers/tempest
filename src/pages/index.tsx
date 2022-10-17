import Head from 'next/head';
import React, { useEffect } from 'react';
import { useUser } from '@tron/nextjs-auth-p1';
import { useRouter } from 'next/router';
import { LoggedInUser } from '../repositories/userRepo';
import { EMtrVariant, ERole } from '../const/enums';

import 'twin.macro';
import { AuthenticatingApp } from '../components/AuthenticatingApp';
import { useQueryClient } from 'react-query';
import { fetchMemberTrackingItems } from '../hooks/api/users';
import { mtiQueryKeys } from '../hooks/api/memberTrackingItem';

function Home() {
  const userQuery = useUser<LoggedInUser>();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!userQuery.user && !userQuery.isLoading) {
      router.push('/Unauthenticated');
    }

    if (userQuery.user && !userQuery.user.organizationId) {
      router.push('/Welcome');
    }

    if (userQuery.user && userQuery.user.role?.name === ERole.MEMBER && userQuery.user.organizationId) {
      queryClient.prefetchQuery(mtiQueryKeys.memberTrackingItems(userQuery.user.id, EMtrVariant.IN_PROGRESS), () =>
        fetchMemberTrackingItems(userQuery.user.id, EMtrVariant.IN_PROGRESS)
      );
      queryClient.prefetchQuery(mtiQueryKeys.memberTrackingItems(userQuery.user.id, EMtrVariant.COMPLETED), () =>
        fetchMemberTrackingItems(userQuery.user.id, EMtrVariant.COMPLETED)
      );
      router.push(`/Profile/${userQuery.user.id}`);
    }

    if (userQuery.user && userQuery.user.role?.name !== ERole.MEMBER && userQuery.user.organizationId) {
      router.push('/Dashboard');
    }
  }, [userQuery.user, userQuery.isLoading]);

  return (
    <div>
      <Head>
        <title>Cascade</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {userQuery.isLoading ? <AuthenticatingApp /> : null}
    </div>
  );
}

export default Home;
