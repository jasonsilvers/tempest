import React, { useState } from 'react';
import { withPageAuth } from '@tron/nextjs-auth-p1';
import { usePermissions } from '../../../hooks/usePermissions';
import { useRouter } from 'next/router';
import { ECategorie, EFuncAction, EMtrVariant, EResource } from '../../../const/enums';
import { GetServerSidePropsContext } from 'next';
import { findUserById, UserWithAll } from '../../../repositories/userRepo';
import { AddMemberTrackingItemDialog } from '../../../components/Records/Dialog/AddMemberTrackingItemDialog';
import 'twin.macro';
import MemberItemTracker from '../../../components/Records/MemberRecordTracker/MemberItemTracker';
import Tab from '../../../components/Records/MemberRecordTracker/Tab';
import { ProfileHeader } from '../../../components/Profile/ProfileHeader';
import { useMember } from '../../../hooks/api/users';
import { BreadCrumbs } from '../../../components/Breadcrumbs';
import { AddIcon } from '../../../assets/Icons';
import { Card, Fab, FormControl, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';

const Profile: React.FC<{ initialMemberData: UserWithAll }> = ({ initialMemberData }) => {
  const {
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
        <div tw="pb-10">
          <BreadCrumbs />
        </div>
      ) : null}
      <div tw="pb-5">
        <ProfileHeader member={member} />
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

        <div tw="absolute top-6 right-6">
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

  const initialMemberData = await findUserById(userId);

  return {
    props: {
      initialMemberData,
      userId,
    },
  };
}
