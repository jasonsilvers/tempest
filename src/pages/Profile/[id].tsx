import React, { useState } from 'react';
import { withPageAuth } from '@tron/nextjs-auth-p1';
import { usePermissions } from '../../hooks/usePermissions';
import { useRouter } from 'next/router';
import { ECategories, EFuncAction, EResource, EUserIncludes } from '../../const/enums';
import { QueryClient } from 'react-query';
import { mtiQueryKeys } from '../../hooks/api/memberTrackingItem';
import { GetStaticPropsContext } from 'next';
import { dehydrate } from 'react-query/hydration';
import { findUserById, findUserByIdWithMemberTrackingItems, UserWithAll } from '../../repositories/userRepo';
import { AddMemberTrackingItemDialog } from '../../components/Records/Dialog/AddMemberTrackingItemDialog';
import { Button } from '../../lib/ui';
import tw from 'twin.macro';
import MemberItemTracker from '../../components/Records/MemberRecordTracker/MemberItemTracker';
import Tab from '../../components/Records/MemberRecordTracker/Tab';
import { ProfileHeader } from '../../components/Profile/ProfileHeader';
import { useMember } from '../../hooks/api/users';
import { BreadCrumbs } from '../../components/Breadcrumbs';

const ButtonContainer = tw.div`fixed right-10 top-5 border`;

const Profile: React.FC<{ initialMemberData: UserWithAll }> = ({ initialMemberData }) => {
  const {
    query: { id },
  } = useRouter();

  const { permissionCheck, role, isLoading, user } = usePermissions();
  const [openAddNewModal, setAddNewModal] = useState(false);

  const userId = parseInt(id?.toString());
  const { data: member } = useMember(userId, initialMemberData);

  if (isLoading || !id) {
    return <div>Loading Profile</div>;
  }

  const persmission =
    user.id !== userId
      ? permissionCheck(role, EFuncAction.READ_ANY, EResource.PROFILE_PAGE)
      : permissionCheck(role, EFuncAction.READ_OWN, EResource.PROFILE_PAGE);

  if (!persmission?.granted) {
    return <div>You do not have permission to view that profile</div>;
  }

  return (
    <div tw="relative min-w-min max-width[1440px]">
      <div tw="pb-20">
        <BreadCrumbs />
      </div>
      <ProfileHeader member={member} />
      <MemberItemTracker
        variant="In Progress"
        title="Training in Progress"
        description="This shows you training that has yet to be completed and signed off."
        userId={userId}
      >
        <Tab category={ECategories.ALL}>Show All</Tab>
        <Tab category={ECategories.SIGNATURE_REQUIRED}>Awaiting Signature</Tab>
        <Tab category={ECategories.TODO}>To Do</Tab>
      </MemberItemTracker>
      <br />
      <MemberItemTracker
        variant="Completed"
        title="Official Training Record"
        description="This shows you your training that has been completed and signed off by the appropriate authority."
        userId={userId}
      >
        <Tab category={ECategories.ALL}>Show All</Tab>
        <Tab category={ECategories.DONE}>Current</Tab>
        <Tab category={ECategories.UPCOMING}>Upcoming</Tab>
        <Tab category={ECategories.OVERDUE}>Overdue</Tab>
      </MemberItemTracker>

      <ButtonContainer>
        <Button
          color="secondary"
          size="medium"
          tw="italic"
          variant="contained"
          onClick={() => {
            setAddNewModal(true);
          }}
        >
          Add New +
        </Button>
      </ButtonContainer>

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

  const userId = parseInt(params?.id as string);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(mtiQueryKeys.memberTrackingItems(userId), () =>
    findUserByIdWithMemberTrackingItems(userId, EUserIncludes.TRACKING_ITEM)
  );

  const initialMemberData = await findUserById(userId);

  return {
    props: {
      dehydrateState: dehydrate(queryClient),
      initialMemberData,
      userId,
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
