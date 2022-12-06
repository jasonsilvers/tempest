import { withPageAuth } from '@tron/nextjs-auth-p1';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { ProfileHeader } from '../../../../components/Profile/ProfileHeader';
import { useMember } from '../../../../hooks/api/users';
import { findUserById, UserWithAll } from '../../../../repositories/userRepo';
import 'twin.macro';
import { Button, Card, Typography } from '@mui/material';
import MemberItemTracker from '../../../../components/Records/MemberRecordTracker/MemberItemTracker';
import { ECategorie, EFuncAction, EMtrVariant, EResource } from '../../../../const/enums';
import Tab from '../../../../components/Records/MemberRecordTracker/Tab';
import { BreadCrumbs } from '../../../../components/Breadcrumbs';
import { usePermissions } from '../../../../hooks/usePermissions';
import { FolderSharedIcon } from '../../../../assets/Icons';

const Archive: React.FC<{ initialMemberData: UserWithAll }> = ({ initialMemberData }) => {
  const {
    push,
    query: { id },
  } = useRouter();

  const userId = parseInt(id?.toString());
  const { permissionCheck, role, isLoading, user } = usePermissions();
  const { data: member } = useMember(userId, initialMemberData);

  const persmission =
    user.id !== userId
      ? permissionCheck(role, EFuncAction.READ_ANY, EResource.PROFILE_PAGE)
      : permissionCheck(role, EFuncAction.READ_OWN, EResource.PROFILE_PAGE);

  const canViewDashboard = permissionCheck(user?.role.name, EFuncAction.READ_ANY, EResource.DASHBOARD_PAGE);
  const isOnOwnProfile = user.id === userId;

  if (isLoading || !id) {
    return <div>Loading Archive Page</div>;
  }

  if (!persmission?.granted) {
    return <div>You do not have permission to view that members archive page</div>;
  }

  return (
    <div tw="relative min-w-min max-width[1440px] p-5">
      {canViewDashboard.granted && !isOnOwnProfile ? (
        <div tw="pb-10 flex items-center">
          <BreadCrumbs text="Archives" />
          <div tw="mr-auto"></div>
          <Button color="secondary" size="medium" onClick={() => push(`/Tempest/Profile/${userId}`)}>
            <FolderSharedIcon sx={{ mr: 1 }} />
            View Training Record
          </Button>
        </div>
      ) : null}
      <div tw="pb-5">
        <ProfileHeader member={member} />
      </div>
      <Card tw="p-8 relative">
        <Typography tw="pb-6" variant="h5">
          Archive
        </Typography>
        <div tw="pb-8">
          <MemberItemTracker variant={EMtrVariant.ARCHIVED} userId={userId} showTabs={false}>
            <Tab category={ECategorie.ALL}>Show All</Tab>
          </MemberItemTracker>
        </div>
      </Card>
    </div>
  );
};

export default withPageAuth(Archive);

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
