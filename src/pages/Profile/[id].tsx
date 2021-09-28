import React, { useState } from 'react';
import { withPageAuth } from '@tron/nextjs-auth-p1';
import { usePermissions } from '../../hooks/usePermissions';
import { useRouter } from 'next/router';
import { ECategories, EFuncAction, EResource, EUserIncludes } from '../../types/global';
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

const ButtonContainer = tw.div`fixed right-10 top-5 border`;

const Profile: React.FC<{ initialMemberData: UserWithAll }> = ({ initialMemberData }) => {
  const {
    query: { id },
  } = useRouter();

  const { permissionCheck, role, isLoading, user } = usePermissions();
  const [openAddNewModal, setAddNewModal] = useState(false);

  const userId = id?.toString();
  const { data: member } = useMember(id.toString(), initialMemberData);

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
      {/* should refactor to use a react query in future */}
      <ProfileHeader user={member} />
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

  const userId = params?.id as string;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(mtiQueryKeys.memberTrackingItems(userId), () =>
    findUserByIdWithMemberTrackingItems(userId, EUserIncludes.TRACKING_ITEMS)
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
