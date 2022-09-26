import { Button, Card, Fab, FormControl, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { withPageAuth } from '@tron/nextjs-auth-p1';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import 'twin.macro';
import { AddIcon, ArchiveIcon } from '../../../assets/Icons';
import { BreadCrumbs } from '../../../components/Breadcrumbs';
import { ProfileHeader } from '../../../components/Profile/ProfileHeader';
import { AddMemberTrackingItemDialog } from '../../../components/Records/Dialog/AddMemberTrackingItemDialog';
import MemberItemTracker from '../../../components/Records/MemberRecordTracker/MemberItemTracker';
import { MemberReport } from '../../../components/Records/MemberRecordTracker/MemberReport';
import Tab from '../../../components/Records/MemberRecordTracker/Tab';
import { ECategorie, EFuncAction, EMtrVariant, EResource } from '../../../const/enums';
import { useMember } from '../../../hooks/api/users';
import { usePermissions } from '../../../hooks/usePermissions';
import { findUserByIdReturnAllIncludes, UserWithAll } from '../../../repositories/userRepo';
import { QuickAssign } from '../../../components/Records/MemberRecordTracker/QuickAssign';

const Profile: React.FC<{ initialMemberData: UserWithAll }> = ({ initialMemberData }) => {
  const {
    push,
    query: { id },
  } = useRouter();

  const { permissionCheck, role, isLoading, user } = usePermissions();
  const [openAddNewModal, setAddNewModal] = useState(false);
  const [view, setView] = useState<EMtrVariant>(EMtrVariant.IN_PROGRESS);
  const userId = parseInt(id?.toString());
  const { data: member } = useMember(userId, initialMemberData);

  if (isLoading || !id) {
    return <div>Loading Profile</div>;
  }

  const handleViewChange = (event: SelectChangeEvent) => {
    setView(event.target.value as EMtrVariant);
  };

  const persmission =
    user.id !== userId
      ? permissionCheck(role, EFuncAction.READ_ANY, EResource.PROFILE_PAGE)
      : permissionCheck(role, EFuncAction.READ_OWN, EResource.PROFILE_PAGE);

  const canViewDashboard = permissionCheck(user?.role.name, EFuncAction.READ_ANY, EResource.DASHBOARD_PAGE);
  const isOnOwnProfile = user.id === userId;

  if (!persmission?.granted) {
    return <div>You do not have permission to view that profile</div>;
  }

  return (
    <div tw="relative min-w-min max-width[1440px] p-5">
      {canViewDashboard.granted && !isOnOwnProfile ? (
        <div tw="pb-10 flex items-center">
          <BreadCrumbs text="Training Record" />
          <div tw="mr-auto"></div>
          <Button color="secondary" size="medium" onClick={() => push(`/Profile/${userId}/Archive`)}>
            <ArchiveIcon sx={{ mr: 1 }} />
            View Archive
          </Button>
        </div>
      ) : null}
      <div tw="pb-5">
        <ProfileHeader member={member} />
      </div>
      <div tw="flex pb-5 gap-5">
        <Card tw="w-2/3">
          <QuickAssign memberId={initialMemberData.id} />
        </Card>
        <Card tw="w-1/3">
          <MemberReport memberId={initialMemberData.id} />
        </Card>
      </div>
      <Card tw="p-8 relative">
        <Typography tw="pb-6" variant="h5">
          My Training
        </Typography>
        <div tw="pb-8">
          <FormControl>
            <Select tw="bg-white w-56" labelId="view-select" id="view-select" value={view} onChange={handleViewChange}>
              <MenuItem value={EMtrVariant.IN_PROGRESS}>Training In Progress</MenuItem>
              <MenuItem value={EMtrVariant.COMPLETED}>Offical Training Record</MenuItem>
            </Select>
          </FormControl>
        </div>

        {view === EMtrVariant.IN_PROGRESS ? (
          <MemberItemTracker variant={EMtrVariant.IN_PROGRESS} userId={userId}>
            <Tab category={ECategorie.ALL}>Show All</Tab>
            <Tab category={ECategorie.SIGNATURE_REQUIRED}>Awaiting Signature</Tab>
            <Tab category={ECategorie.TODO}>To Do</Tab>
          </MemberItemTracker>
        ) : null}

        {view === EMtrVariant.COMPLETED ? (
          <MemberItemTracker variant={EMtrVariant.COMPLETED} userId={userId}>
            <Tab category={ECategorie.ALL}>Show All</Tab>
            <Tab category={ECategorie.DONE}>Current</Tab>
            <Tab category={ECategorie.UPCOMING}>Upcoming</Tab>
            <Tab category={ECategorie.OVERDUE}>Overdue</Tab>
          </MemberItemTracker>
        ) : null}

        <div tw="absolute top-6 right-6 flex space-x-10">
          <Fab
            color="secondary"
            size="medium"
            variant="extended"
            onClick={() => {
              setAddNewModal(true);
            }}
          >
            <AddIcon sx={{ mr: 1 }} />
            Add
          </Fab>
        </div>
      </Card>

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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { params } = context;

  const userId = parseInt(params?.id as string);

  const initialMemberData = await findUserByIdReturnAllIncludes(userId);

  return {
    props: {
      initialMemberData,
      userId,
    },
  };
}
