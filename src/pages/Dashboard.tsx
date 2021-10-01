import { getUsersWithMemberTrackingRecords } from '../repositories/userRepo';
import tw from 'twin.macro';
import { LoadingSpinner, TempestPopMenu } from '../lib/ui';
import { CancelIcon, CheckCircleIcon, HighlightOffIcon, WarningIcon } from '../assets/Icons';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import { useUsers } from '../hooks/api/users';
import { useEffect, useState } from 'react';
import { getStatus } from '../utils/status';
import { usePermissions } from '../hooks/usePermissions';
import { EFuncAction, EResource } from '../const/enums';
import { removeOldCompletedRecords } from '../utils';
import dayjs from 'dayjs';
import { MemberTrackingRecord } from '.prisma/client';
import { MemberTrackingItemWithAll } from '../repositories/memberTrackingRepo';

const Card = tw.div`overflow-x-hidden overflow-y-hidden bg-white rounded-md filter drop-shadow-md p-2`;
const UserTable = tw.div``;
const UserTableHeader = tw.div`flex text-sm text-gray-400 mb-4 pl-2 border-b border-gray-400`;
const UserTableRow = ({ isOdd, children }: { isOdd: boolean; children: React.ReactNode }) => {
  return <div css={[isOdd && tw`bg-gray-100`, tw`pl-2 flex py-2 justify-center items-center`]}>{children}</div>;
};

const UserTableColumn = tw.div``;

type StatusPillVariantType = 'Done' | 'Overdue' | 'Upcoming' | 'None';
const StatusPillVariant = {
  Done: {
    color: tw`bg-[#6FD9A6]`,
    textColor: tw`text-white`,
  },
  Overdue: {
    color: tw`bg-[#FB7F7F]`,
    textColor: tw`text-white`,
  },
  Upcoming: {
    color: tw`bg-[#F6B83F]`,
    textColor: tw`text-white`,
  },
  None: {
    color: tw`border border-gray-400`,
    textColor: tw`text-gray-400`,
  },
};

const initialCounts = {
  All: 0,
  Overdue: 0,
  Upcoming: 0,
  Done: 0,
};

const StatusPill = ({ variant, count }: { variant: StatusPillVariantType; count: number }) => {
  return (
    <div
      css={[
        StatusPillVariant[variant].color,
        StatusPillVariant[variant].textColor,
        tw`rounded-full h-5 w-5 flex items-center justify-center text-sm`,
      ]}
    >
      {count}
    </div>
  );
};

type StatusCounts = typeof initialCounts;

type AllCounts = {
  All: number;
  Overdue: number;
  Upcoming: number;
  Done: number;
  [key: string]: StatusCounts | number;
};

type UserCounts = Omit<StatusCounts, 'All'>;
const determineMemberCounts = (
  userId: string,
  mti: MemberTrackingItemWithAll,
  mtr: MemberTrackingRecord,
  newCounts: StatusCounts,
  userCounts: UserCounts
): AllCounts => {
  if (mtr.authoritySignedDate && mtr.traineeSignedDate) {
    newCounts.All = newCounts.All + 1;
    const status = getStatus(mtr.completedDate, mti.trackingItem.interval);
    newCounts[status] = newCounts[status] + 1;
    userCounts[status] = userCounts[status] + 1;
  } else {
    const today = dayjs();
    const dateTrainingGivenToMember = dayjs(mtr.createdAt);

    const differenceInDays = today.diff(dateTrainingGivenToMember, 'days');
    if (differenceInDays && differenceInDays > 30) {
      newCounts.Overdue = newCounts.Overdue + 1;
      userCounts.Overdue = userCounts.Overdue + 1;
    } else {
      newCounts.Upcoming = newCounts.Upcoming + 1;
      userCounts.Upcoming = userCounts.Upcoming + 1;
    }
  }

  return newCounts;
};

const DashboardPage: React.FC = () => {
  const { user: loggedInUser, permissionCheck, isLoading } = usePermissions();

  const users = useUsers();
  const [counts, setCounts] = useState(initialCounts);

  const permission = permissionCheck(loggedInUser?.role?.name, EFuncAction.READ_ANY, EResource.USER);
  useEffect(() => {
    const newCounts = { ...initialCounts };
    users?.data?.forEach((user) => {
      const userCounts = {
        Overdue: 0,
        Upcoming: 0,
        Done: 0,
      };
      newCounts[user.id] = userCounts;
      user.memberTrackingItems.forEach((mti) => {
        const mtrWithOldCompletedRecordsRemoved = removeOldCompletedRecords(mti.memberTrackingRecords);
        mtrWithOldCompletedRecordsRemoved.forEach((mtr) => {
          determineMemberCounts(user.id, mti, mtr, newCounts, userCounts);
        });

        setCounts(newCounts);
      });
    });
  }, [users?.data]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!permission.granted) {
    return <div>you are not allowed to view this page</div>;
  }

  return (
    <main tw="pr-14 max-width[900px] min-width[720px]">
      <div tw="flex space-x-8 pb-5">
        <Card tw="h-24 flex-grow border-2 border-primary">
          <div tw="flex fixed right-2">{users.isLoading ? <LoadingSpinner size={'10px'} /> : null}</div>
          <h1 tw="text-primary pl-1 underline">All</h1>

          <div tw="flex items-end pt-3">
            <HighlightOffIcon fontSize="large" tw="text-primary invisible" />
            <h2 tw="ml-auto text-5xl text-primary">{counts.All}</h2>
          </div>
        </Card>
        <Card tw="h-24 flex-grow bg-[#FB7F7F]">
          <div tw="flex fixed right-2">{users.isLoading ? <LoadingSpinner size={'10px'} /> : null}</div>
          <h1 tw="text-white pl-1">Overdue</h1>

          <div tw="flex items-end pt-3">
            <CancelIcon fontSize="large" tw="text-white" />
            <h2 tw="ml-auto text-5xl text-white">{counts.Overdue}</h2>
          </div>
        </Card>
        <Card tw="h-24 flex-grow bg-[#F6B83F]">
          <div tw="flex fixed right-2">{users.isLoading ? <LoadingSpinner size={'10px'} /> : null}</div>
          <h1 tw="text-white pl-1">Upcoming</h1>

          <div tw="flex items-end pt-3">
            <WarningIcon fontSize="large" tw="text-white" />
            <h2 tw="ml-auto text-5xl text-white">{counts.Upcoming}</h2>
          </div>
        </Card>
        <Card tw="h-24 flex-grow bg-[#6FD9A6]">
          <div tw="flex fixed right-2">{users.isLoading ? <LoadingSpinner size={'10px'} /> : null}</div>
          <h1 tw="text-white pl-1">Done</h1>

          <div tw="flex items-end pt-3">
            <CheckCircleIcon fontSize="large" tw="text-white" />
            <h2 tw="ml-auto text-5xl text-white">{counts.Done}</h2>
          </div>
        </Card>
      </div>

      <Card tw="p-5">
        <UserTable>
          <UserTableHeader>
            <UserTableColumn tw="w-1/3">Name</UserTableColumn>
            <UserTableColumn tw="w-1/6">Rank</UserTableColumn>
            <UserTableColumn tw="w-1/6 flex justify-center">Status</UserTableColumn>
            <UserTableColumn tw="ml-auto mr-4">Actions</UserTableColumn>
          </UserTableHeader>

          {users.data?.map((user, index) => (
            <UserTableRow isOdd={!!(index % 2)} key={user.id} tw="text-sm mb-2 flex">
              <UserTableColumn tw="w-1/3">
                {`${user.firstName} ${user.lastName} ${user.id === loggedInUser.id ? '(You)' : ''}`}
              </UserTableColumn>
              <UserTableColumn tw="w-1/6">{user.rank}</UserTableColumn>
              <UserTableColumn tw="w-1/6 flex justify-center">
                <div tw="flex space-x-2">
                  <StatusPill variant="Overdue" count={counts[user.id]?.Overdue} />
                  <StatusPill variant="Upcoming" count={counts[user.id]?.Upcoming} />
                  <StatusPill variant="Done" count={counts[user.id]?.Done} />
                </div>
              </UserTableColumn>
              <UserTableColumn tw="ml-auto mr-6">
                <TempestPopMenu userId={user.id} />
              </UserTableColumn>
            </UserTableRow>
          ))}
        </UserTable>
      </Card>
    </main>
  );
};

export default DashboardPage;

export const getStaticProps = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(['users'], () => getUsersWithMemberTrackingRecords());

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60,
  };
};
