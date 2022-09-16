import { Button, Card, CardActions, CardContent, InputAdornment, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import 'twin.macro';
import { TrackingItemInterval } from '../../../../src/utils/daysToString';
import { SearchIcon } from '../../../assets/Icons';
import { ECategorie } from '../../../const/enums';
import { useMemberTrackingItemsForUser } from '../../../hooks/api/users';
import { MemberTrackingItemWithAll } from '../../../repositories/memberTrackingRepo';
import { removeInProgressRecords, removeOldCompletedRecords } from '../../../utils';
import { getStatus } from '../../../utils/status';

type UpcomingTrainingDetailsProps = {
  memberTrackingItems: MemberTrackingItemWithAll[];
};

const UpcomingTrainingDetails: React.FC<UpcomingTrainingDetailsProps> = ({ memberTrackingItems }) => {
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
    });

  return (
    <div tw="flex justify-center gap-5 overflow-auto px-5">
      {upcomingTrainingDetailsData
        ?.filter((mti) => mti.status === ECategorie.UPCOMING)
        .map((filteredMti) => (
          <Card variant="outlined" key={filteredMti.id} tw="box-border shadow-xl w-1/4 rounded-xl">
            <CardContent tw="pb-0">
              <Typography tw="text-xs text-center font-bold">{filteredMti.trainingTitle}</Typography>
              <Typography tw="text-xs text-center leading-6">{filteredMti.recurrence}</Typography>
              <Typography tw="text-xs text-center leading-6">{filteredMti.dueDate}</Typography>
            </CardContent>
            <CardActions tw="flex justify-center w-full">
              <Button variant="outlined" size="small" tw="w-[150px]">
                Quick Add
              </Button>
            </CardActions>
          </Card>
        ))}
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
    <div tw="flex flex-auto space-x-2 items-center">
      <div tw="items-center pb-5 flex-wrap">
        <div tw="w-full px-5 pt-3">
          <TextField
            tw="bg-white rounded w-full pb-5 max-w-3xl"
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
        <UpcomingTrainingDetails memberTrackingItems={memberTrackingItemsQuery.data} />
      </div>
    </div>
  );
};
