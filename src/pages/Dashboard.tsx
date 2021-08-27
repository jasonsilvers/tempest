import { getUsersWithMemberTrackingRecords } from '../repositories/userRepo';
import { User } from '@prisma/client';
import tw from 'twin.macro';
import { useUser } from '@tron/nextjs-auth-p1';
import { LoadingSpinner, IconButton, TempestPopMenu, TempestMenuItem } from '../lib/ui';
import { CheckCircleOutlineIcon, HighlightOffIcon, MoreHorizIcon, WarningIcon } from '../assets/Icons';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import { useUsers } from '../hooks/api/users';
import { useEffect } from 'react';
import { useState } from 'react';
import { getStatus } from '../utils/Status';

const Card = tw.div`overflow-y-auto overflow-x-hidden bg-white rounded-md filter drop-shadow-md p-2`;
const UserTable = tw.div``;
const UserTableHeader = tw.div`flex text-sm text-gray-400 mb-4 pl-2 border-b border-gray-400`;
const UserTableRow = tw.div`pl-2 flex pb-4`;
const UserTableColumn = tw.div``;

type StatusPillVariantType = 'Done' | 'Overdue' | 'Upcoming';
const StatusPillVariant = {
  Done: {
    color: tw`bg-[#6FD9A6]`,
  },
  Overdue: {
    color: tw`bg-[#FB7F7F]`,
  },
  Upcoming: {
    color: tw`bg-[#F6B83F]`,
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
    <div css={[StatusPillVariant[variant].color, tw`rounded-full h-5 w-5 flex items-center justify-center text-white`]}>
      {count}
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { user: loggedInUser } = useUser<User>();
  const users = useUsers();
  const [counts, setCounts] = useState(initialCounts);
  const [countsIsLoading, setCountsIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    setCountsIsLoading(true);
    const newCounts = { ...initialCounts };
    users.data?.forEach((user) => {
      const userCounts = {
        Overdue: 0,
        Upcoming: 0,
        Done: 0,
      };

      user.memberTrackingItems.forEach((mti) => {
        mti.memberTrackingRecords.forEach((mtr) => {
          if (mtr.authoritySignedDate && mtr.traineeSignedDate) {
            newCounts.All = newCounts.All + 1;
            const status = getStatus(mtr.completedDate, mti.trackingItem.interval);
            newCounts[status] = newCounts[status] + 1;

            userCounts[status] = userCounts[status] + 1;
          }
        });
      });

      newCounts[user.id] = userCounts;
      setCounts(newCounts);
    });

    setCountsIsLoading(false);
  }, [users.data]);

  if (!loggedInUser && !loggedInUser?.id) {
    return <p>Loading...</p>;
  }
  return (
    <main tw="pr-14 max-width[900px] min-width[720px]">
      <div tw="flex space-x-8 pb-5">
        <Card tw="h-24 flex-grow border-2 border-primary">
          <div tw="flex fixed right-2">{countsIsLoading ? <LoadingSpinner size={'10px'} /> : null}</div>
          <h1 tw="text-primary pl-1 underline">All</h1>

          <div tw="flex items-end pt-3">
            <HighlightOffIcon fontSize="large" tw="text-primary invisible" />
            <h2 tw="ml-auto text-4xl text-primary">{counts.All}</h2>
          </div>
        </Card>
        <Card tw="h-24 flex-grow bg-[#FB7F7F]">
          <div tw="flex fixed right-2">{countsIsLoading ? <LoadingSpinner size={'10px'} /> : null}</div>
          <h1 tw="text-white pl-1">Overdue</h1>

          <div tw="flex items-end pt-3">
            <HighlightOffIcon fontSize="large" tw="text-white" />
            <h2 tw="ml-auto text-4xl text-white">{counts.Overdue}</h2>
          </div>
        </Card>
        <Card tw="h-24 flex-grow bg-[#F6B83F]">
          <div tw="flex fixed right-2">{countsIsLoading ? <LoadingSpinner size={'10px'} /> : null}</div>
          <h1 tw="text-white pl-1">Upcoming</h1>

          <div tw="flex items-end pt-3">
            <WarningIcon fontSize="large" tw="text-white" />
            <h2 tw="ml-auto text-4xl text-white">{counts.Upcoming}</h2>
          </div>
        </Card>
        <Card tw="h-24 flex-grow bg-[#6FD9A6]">
          <div tw="flex fixed right-2">{countsIsLoading ? <LoadingSpinner size={'10px'} /> : null}</div>
          <h1 tw="text-white pl-1">Done</h1>

          <div tw="flex items-end pt-3">
            <CheckCircleOutlineIcon fontSize="large" tw="text-white" />
            <h2 tw="ml-auto text-4xl text-white">{counts.Done}</h2>
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

          {users.data?.map((user) => (
            <UserTableRow key={user.id} tw="text-sm mb-2 flex">
              <UserTableColumn tw="w-1/3">
                {`${user.lastName},${user.firstName} ${user.id === loggedInUser.id ? '(You)' : ''}`}
              </UserTableColumn>
              <UserTableColumn tw="w-1/6">{user.rank}</UserTableColumn>
              <UserTableColumn tw="w-1/6 flex justify-center">
                <div tw="flex space-x-2">
                  <StatusPill variant="Overdue" count={counts[user.id]?.Overdue}></StatusPill>
                  <StatusPill variant="Upcoming" count={counts[user.id]?.Upcoming}></StatusPill>
                  <StatusPill variant="Done" count={counts[user.id]?.Done}></StatusPill>
                </div>
              </UserTableColumn>
              <UserTableColumn tw="ml-auto mr-6">
                <IconButton
                  aria-label={`member-popup-menu`}
                  size="small"
                  onClick={handleMenuClick}
                  tw="hover:bg-transparent"
                >
                  <MoreHorizIcon />
                </IconButton>
              </UserTableColumn>
              <TempestPopMenu anchorEl={anchorEl} handleClose={handleMenuClose}>
                <TempestMenuItem tw="text-accent text-sm" onClick={handleMenuClose}>
                  View Member Profile
                </TempestMenuItem>
              </TempestPopMenu>
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
      dehyradtedState: dehydrate(queryClient),
    },
    revalidate: 60,
  };
};
