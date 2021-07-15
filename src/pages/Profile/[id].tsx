import React, { useState } from 'react';
import { withPageAuth } from '@tron/nextjs-auth-p1';
import { usePermissions } from '../../hooks/usePermissions';
import MemberItemTracker from '../../components/Records/MemberRecordTracker';
import HeaderUser from '../../components/Records/RecordHeader';
import { useRouter } from 'next/router';
import { ECategories, EFuncAction, EResource, EUserIncludes } from '../../types/global';
import { QueryClient } from 'react-query';
import { mtiQueryKeys } from '../../hooks/api/memberTrackingItem';
import { GetStaticPropsContext } from 'next';
import { dehydrate } from 'react-query/hydration';
import { findUserByIdWithMemberTrackingItems } from '../../repositories/userRepo';
import Tab from '../../components/Records/Tab';
import { AddMemberTrackingItemDialog } from '../../components/Records/Dialog/AddMemberTrackingItemDialog';
import { Link } from '../../lib/ui';
import tw from 'twin.macro';

const AddNewButton = tw(Link)`italic absolute -bottom-10 right-10`;

const Profile = () => {
  const {
    query: { id },
  } = useRouter();

  const { permissionCheck, role, isLoading, user } = usePermissions();
  const [openAddNewModal, setAddNewModal] = useState(false);

  const userId = id?.toString();
  //Used to prevent the count for the tabs incrementing each time the page is loaded
  // useEffect(() => {
  //   return () => resetCount();
  // }, []);

  if (isLoading || !id) {
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
    <div tw="relative min-w-min max-width[1440px]">
      <HeaderUser />
      <MemberItemTracker title="Training in Progress" userId={userId}>
        <Tab category={ECategories.ALL}>All</Tab>
        <Tab category={ECategories.SIGNATURE_REQUIRED}>Awaiting Signature</Tab>
        <Tab category={ECategories.TODO}>To Do</Tab>
      </MemberItemTracker>
      <br />
      <MemberItemTracker title="Official Training Record" userId={userId}>
        <Tab category={ECategories.ALL}>All</Tab>
        <Tab category={ECategories.DONE}>Current</Tab>
        <Tab category={ECategories.UPCOMING}>Upcoming</Tab>
        <Tab category={ECategories.OVERDUE}>Overdue</Tab>
      </MemberItemTracker>

      <AddNewButton
        component="button"
        variant="body2"
        onClick={() => {
          setAddNewModal(true);
        }}
      >
        Add New +
      </AddNewButton>

      {openAddNewModal ? (
        <AddMemberTrackingItemDialog
          forMemberId={userId}
          handleClose={() => setAddNewModal(false)}
        ></AddMemberTrackingItemDialog>
      ) : null}
    </div>
  );
};

export default withPageAuth(Profile);

export async function getStaticProps(context: GetStaticPropsContext) {
  const { params } = context;

  const userId = params?.id as string;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(mtiQueryKeys.memberTrackingItems(userId), () =>
    findUserByIdWithMemberTrackingItems(userId, EUserIncludes.TRACKING_ITEMS)
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