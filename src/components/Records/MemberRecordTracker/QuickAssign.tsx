import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import { MemberTrackingRecord } from '@prisma/client';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import React, { useMemo, useState } from 'react';
import 'twin.macro';
import { TrackingItemInterval } from '../../../../src/utils/daysToString';
import { ECategorie } from '../../../const/enums';
import { useCreateMemberTrackingRecord } from '../../../hooks/api/memberTrackingRecord';
import { useMemberTrackingItemsForUser } from '../../../hooks/api/users';
import { MemberTrackingItemWithAll } from '../../../repositories/memberTrackingRepo';
import { removeInProgressRecords, removeOldCompletedRecords } from '../../../utils';
import { getStatus } from '../../../utils/status';

type UpcomingTrainingDetailsProps = {
  memberTrackingItems: MemberTrackingItemWithAll[];
  forMemberId: number;
};

type IMemberTrackingItemsToAdd = {
  id: number;
  trainingTitle: string;
  recurrence: string;
  status: string;
  dueDate: string;
};

const MemberUpcomingTrackingItemList: React.FC<UpcomingTrainingDetailsProps> = ({
  memberTrackingItems,
  forMemberId,
}) => {
  const addMemberTrackingRecord = useCreateMemberTrackingRecord();
  const { enqueueSnackbar } = useSnackbar();
  const [memberTrackingItemsToAdd, setMemberTrackingItemsToAdd] = useState<IMemberTrackingItemsToAdd[]>([]);

  useMemo(() => {
    if (memberTrackingItems?.length > 0) {
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
        ?.filter((mti) => mti.status === ECategorie.UPCOMING || mti.status === ECategorie.OVERDUE);

      setMemberTrackingItemsToAdd(upcomingTrainingDetailsData);
    }
  }, [memberTrackingItems?.length]);

  const handleAddMemberTrackingItem = (memberTrackingItemToAdd: IMemberTrackingItemsToAdd, memberId: number) => {
    const newMemberTrackingRecord: Partial<MemberTrackingRecord> = {
      trackingItemId: memberTrackingItemToAdd.id,
      completedDate: null,
      traineeId: memberId,
    };

    addMemberTrackingRecord.mutate(newMemberTrackingRecord, {
      onSuccess: () => {
        enqueueSnackbar('A record was successfully added', { variant: 'success' });
      },
    });
    const mtisWithNewItemRemoved = memberTrackingItemsToAdd?.filter(
      (trackingItem) => trackingItem.id !== newMemberTrackingRecord.trackingItemId
    );
    setMemberTrackingItemsToAdd(mtisWithNewItemRemoved);
  };

  return (
    <>
      <Typography tw="text-xl font-bold text-center pt-2">{`${memberTrackingItemsToAdd?.length} Overdue/Upcomging Trainings`}</Typography>
      <div tw="grid grid-flow-col overflow-auto px-5 py-4 gap-5 place-items-center">
        {memberTrackingItemsToAdd.map((filteredMti) => (
          <>
            <Card key={filteredMti.id} tw="w-[170px] h-[150px] shadow-xl rounded-xl" elevation={10}>
              <CardContent tw="pb-0">
                <Typography tw="text-xs text-center font-bold truncate">{filteredMti.trainingTitle}</Typography>
                <Typography tw="text-xs text-center leading-6">{filteredMti.recurrence}</Typography>
                <Typography tw="text-xs text-center leading-6">{filteredMti.dueDate}</Typography>
              </CardContent>
              <CardActions tw="flex justify-center w-full">
                <Button
                  variant="outlined"
                  onClick={() => handleAddMemberTrackingItem(filteredMti, forMemberId)}
                  size="small"
                  tw="w-3/4"
                  data-testid="quickAddButton"
                >
                  + Add
                </Button>
              </CardActions>
            </Card>
          </>
        ))}
      </div>
    </>
  );
};

type QuickAssignProps = {
  memberId: number;
};
export const QuickAssign: React.FC<QuickAssignProps> = ({ memberId }) => {
  const memberTrackingItemsQuery = useMemberTrackingItemsForUser(memberId);

  if (memberTrackingItemsQuery.isLoading) {
    return <div>...Loading</div>;
  }

  return (
    <div tw="flex flex-auto space-x-2 items-center max-w-5xl">
      <div tw="w-full items-center flex-wrap">
        <MemberUpcomingTrackingItemList memberTrackingItems={memberTrackingItemsQuery.data} forMemberId={memberId} />
      </div>
    </div>
  );
};
