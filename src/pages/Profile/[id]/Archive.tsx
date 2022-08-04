import { withPageAuth } from '@tron/nextjs-auth-p1';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { ProfileHeader } from '../../../components/Profile/ProfileHeader';
import { useMember } from '../../../hooks/api/users';
import { findUserById, UserWithAll } from '../../../repositories/userRepo';
import 'twin.macro';
import { Card, Typography } from '@mui/material';
import MemberItemTracker from '../../../components/Records/MemberRecordTracker/MemberItemTracker';
import { ECategorie, EMtrVariant } from '../../../const/enums';
import Tab from '../../../components/Records/MemberRecordTracker/Tab';

const Archive: React.FC<{ initialMemberData: UserWithAll }> = ({ initialMemberData }) => {
  const {
    query: { id },
  } = useRouter();

  const userId = parseInt(id?.toString());

  const { data: member } = useMember(userId, initialMemberData);

  return (
    <div tw="relative min-w-min max-width[1440px] p-5">
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
