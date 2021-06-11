import React, { useEffect } from 'react';
import { withPageAuth } from '@tron/nextjs-auth-p1';
import usePermissions from '../../hooks/usePermissions';
import MemberItemTracker from '../../components/Records/MemberRecordTracker';
import { useMemberRecordTrackerState } from '../../hooks/uiState';
import HeaderUser from '../../components/Records/RecordHeader';
import { useRouter } from 'next/router';
import { EFuncAction, EResource } from '../../types/global';
import { QueryClient } from 'react-query';
import { mtiQueryKeys } from '../../hooks/api/memberTrackingItem';
import { GetStaticPropsContext } from 'next';
import { dehydrate } from 'react-query/hydration';
import { findUserById } from '../../repositories/userRepo';

const Profile = () => {
  const {
    query: { id },
  } = useRouter();
  const resetCount = useMemberRecordTrackerState((state) => state.resetCount);

  const { permissionCheck, role, isLoading, user } = usePermissions();

  const userId = id?.toString();
  //Used to prevent the count for the tabs incrementing each time the page is loaded
  useEffect(() => {
    return () => resetCount();
  }, []);

  if (isLoading) {
    return <div>Loading Profile</div>;
  }

  const persmission =
    user.id !== id
      ? permissionCheck(role, EFuncAction.READ_ANY, EResource.PROFILE)
      : permissionCheck(role, EFuncAction.READ_OWN, EResource.PROFILE);

  if (!persmission?.granted) {
    return <div>You do not have permission to view that profile</div>;
  }

  return (
    <>
      <HeaderUser />
      <MemberItemTracker userId={userId} />
    </>
  );
};

export default withPageAuth(Profile);

export async function getStaticProps(context: GetStaticPropsContext) {
  const { params } = context;

  const userId = params?.id as string;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(mtiQueryKeys.memberTrackingItems(userId), () =>
    findUserById(userId, { withMemberTrackingItems: true })
  );

  return {
    props: {
      dehydrateState: dehydrate(queryClient),
    },
    revalidate: 30,
  };
}

export async function getStaticPaths() {
  return {
    // Return an empty paths so pages aren't generated at build but will
    // generate the static page at request based on the revalidate time above
    paths: [],
    fallback: true,
  };
}
