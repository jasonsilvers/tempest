import { Button, Card, CardActions, CardContent, InputAdornment, TextField, Typography } from '@mui/material';
import { MemberTrackingItem, MemberTrackingItemStatus } from '@prisma/client';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import React from 'react';
import 'twin.macro';
import { TrackingItemInterval } from '../../../../src/utils/daysToString';
import { SearchIcon } from '../../../assets/Icons';
import { ECategorie } from '../../../const/enums';
import { useCreateMemberTrackingItemAndRecord } from '../../../hooks/api/memberTrackingItem';
import { useMemberTrackingItemsForUser } from '../../../hooks/api/users';
import { MemberTrackingItemWithAll } from '../../../repositories/memberTrackingRepo';
import { removeInProgressRecords, removeOldCompletedRecords } from '../../../utils';
import { getStatus } from '../../../utils/status';

type UpcomingTrainingDetailsProps = {
  memberTrackingItems: MemberTrackingItemWithAll[];
  forMemberId: number;
};

const MemberUpcomingTrackingItemList: React.FC<UpcomingTrainingDetailsProps> = ({
  memberTrackingItems,
  forMemberId,
}) => {
  const addMemberTrackingItemAndRecord = useCreateMemberTrackingItemAndRecord();
  const { enqueueSnackbar } = useSnackbar();
  const upcomingTrainingDetailsData = memberTrackingItems
    ?.filter((member) => member.memberTrackingRecords.length !== 0)
    .flatMap((mti) => {
      return removeOldCompletedRecords(removeInProgressRecords(mti.memberTrackingRecords)).map((mtr) => {
        return {
          id: mti.trackingItem.id,
          trainingTitle: mti.trackingItem.title,
          recurrence: TrackingItemInterval[mti.trackingItem.interval],
          status: getStatus(mtr.completedDate, mti.trackingItem.interval),
          dueDate: dayjs(mtr.completedDate).add(mti.trackingItem.interval, 'days').format('MMM D, YYYY'),
        };
      });
    })
    ?.filter((mti) => mti.status === ECategorie.OVERDUE || ECategorie.UPCOMING)
    .filter(
      (trackingItem) =>
        !memberTrackingItems?.find(
          (mti) => mti.status === MemberTrackingItemStatus.INACTIVE && mti.trackingItemId === trackingItem.id
        )
    );

  const handleAddMemberTrackingItem = (memberTrackingItemToAdd, memberId: number) => {
    const newMemberTrackingItem = {
      trackingItemId: memberTrackingItemToAdd.id,
      userId: memberId,
    } as MemberTrackingItem;
    addMemberTrackingItemAndRecord.mutate(
      {
        newMemberTrackingItem,
        completedDate: null,
      },
      {
        onSuccess: () => {
          enqueueSnackbar('A record was successfully added', { variant: 'success' });
        },
      }
    );
  };

  return (
    <div tw="grid grid-flow-col overflow-auto px-5 py-2 divide-x">
      {/* {upcomingTrainingDetailsData && (
        <IconButton >
          <ChevronLeftIcon />
        </IconButton>
      )} */}
      {upcomingTrainingDetailsData?.length > 0 ? (
        upcomingTrainingDetailsData.map((filteredMti) => (
          <>
            <Card key={filteredMti.id} tw=" w-[170px] h-[150px]" elevation={0}>
              <CardContent tw="pb-0">
                <Typography tw="text-xs text-center font-bold">{filteredMti.trainingTitle}</Typography>
                <Typography tw="text-xs text-center leading-6">{filteredMti.recurrence}</Typography>
                <Typography tw="text-xs text-center leading-6">{filteredMti.dueDate}</Typography>
              </CardContent>
              <CardActions tw="flex justify-center w-full">
                <Button
                  variant="outlined"
                  onClick={() => handleAddMemberTrackingItem(filteredMti, forMemberId)}
                  size="small"
                  tw="flex flex-1 flex-col justify-between"
                >
                  + Add
                </Button>
              </CardActions>
            </Card>
          </>
        ))
      ) : (
        <Typography tw="text-2xl font-bold text-center">No Upcoming Trainings</Typography>
      )}
      {/* {upcomingTrainingDetailsData && (
        <IconButton >
         <ChevronRightIcon />
        </IconButton>
      )} */}
    </div>
  );
};

type QuickAssignProps = {
  memberId: number;
};
export const QuickAssign: React.FC<QuickAssignProps> = ({ memberId }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const memberTrackingItemsQuery = useMemberTrackingItemsForUser(memberId);

  return (
    <div tw="flex flex-auto space-x-2 items-center max-w-5xl">
      <div tw="w-full items-center flex-wrap">
        <div tw="px-5 pt-3">
          <TextField
            tw="bg-white rounded w-full max-w-4xl"
            id="SearchBar"
            label="Search"
            size="small"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </div>
        <MemberUpcomingTrackingItemList memberTrackingItems={memberTrackingItemsQuery.data} forMemberId={memberId} />
      </div>
    </div>
  );
};
