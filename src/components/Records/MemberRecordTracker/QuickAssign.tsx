import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import { MemberTrackingItemStatus, MemberTrackingRecord } from '@prisma/client';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import React, { useMemo } from 'react';
import 'twin.macro';
import { TrackingItemInterval } from '../../../../src/utils/daysToString';
import { ECategorie } from '../../../const/enums';
import { useCreateMemberTrackingRecord } from '../../../hooks/api/memberTrackingRecord';
import { useMemberTrackingItemsForUser } from '../../../hooks/api/users';
import { MemberTrackingItemWithAll } from '../../../repositories/memberTrackingRepo';
import { removeOldCompletedRecords } from '../../../utils';
import { getStatus } from '../../../utils/status';

type UpcomingTrainingDetailsProps = {
  memberTrackingItems: MemberTrackingItemWithAll[];
  forMemberId: number;
};

type IMemberTrackingItemsToAdd = {
  id: number;
  trainingTitle: string;
  recurrence: string;
  dueDate: string;
};

const MemberUpcomingTrackingItemList: React.FC<UpcomingTrainingDetailsProps> = ({
  memberTrackingItems,
  forMemberId,
}) => {
  const addMemberTrackingRecord = useCreateMemberTrackingRecord();
  const { enqueueSnackbar } = useSnackbar();

  const memberTrackingItemsToAdd: IMemberTrackingItemsToAdd[] = useMemo(() => {
    return memberTrackingItems
      ?.filter((mti) => {
        if (mti.status === MemberTrackingItemStatus.INACTIVE) {
          return false;
        }

        //Need to have a completed record
        const lastCompletedRecordAndInprogress = removeOldCompletedRecords(mti.memberTrackingRecords);
        const completedMemberTrackingRecord = lastCompletedRecordAndInprogress.find(
          (mtr) => mtr.completedDate !== null && mtr.authoritySignedDate !== null && mtr.traineeSignedDate !== null
        );
        const inProgressMemberTrackingRecord = lastCompletedRecordAndInprogress.find(
          (mtr) => mtr.completedDate === null || mtr.traineeSignedDate === null || mtr.authoritySignedDate === null
        );

        const completedRecordState = getStatus(
          completedMemberTrackingRecord?.completedDate,
          completedMemberTrackingRecord?.trackingItem?.interval
        );

        if (completedRecordState === ECategorie.DONE) {
          return false;
        }
        if (completedMemberTrackingRecord && inProgressMemberTrackingRecord) {
          return false;
        }

        if (completedMemberTrackingRecord && inProgressMemberTrackingRecord === undefined) {
          return true;
        }
        //I don't think it will ever reach this but keeping here just in case
        return false;
      })
      .flatMap((mti) => {
        return mti.memberTrackingRecords.map((mtr) => {
          return {
            id: mti.trackingItem.id,
            trainingTitle: mti.trackingItem.title,
            recurrence: TrackingItemInterval[mti.trackingItem.interval],
            dueDate: dayjs(mtr.completedDate).add(mti.trackingItem.interval, 'days').format('MMM D, YYYY'),
          };
        });
      });
  }, [memberTrackingItems]);

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
  };

  return (
    <>
      {memberTrackingItemsToAdd.length > 0 ? (
        <Typography
          variant="h6"
          tw=" pl-4 pt-4"
        >{`${memberTrackingItemsToAdd?.length} Overdue/Upcoming Trainings`}</Typography>
      ) : (
        <Typography variant="h6" tw="pl-4 pt-4">
          Upcoming Training
        </Typography>
      )}
      <div tw="flex space-x-5 overflow-auto px-5 py-4 place-items-start">
        {memberTrackingItemsToAdd.map((memberTrackingItemToAdd) => (
          <Card key={memberTrackingItemToAdd.id} tw="min-w-[170px] h-[150px] shadow-lg rounded-xl">
            <CardContent tw="pb-0">
              <Typography tw="text-xs text-center font-bold truncate max-w-[150px]">
                {memberTrackingItemToAdd.trainingTitle}
              </Typography>
              <Typography tw="text-xs text-center leading-6">{memberTrackingItemToAdd.recurrence}</Typography>
              <Typography tw="text-xs text-center leading-6">{memberTrackingItemToAdd.dueDate}</Typography>
            </CardContent>
            <CardActions tw="flex justify-center w-full">
              <Button
                variant="outlined"
                onClick={() => handleAddMemberTrackingItem(memberTrackingItemToAdd, forMemberId)}
                size="small"
                tw="w-3/4"
                data-testid="quickAddButton"
                aria-label="quick-add-button"
              >
                + Add
              </Button>
            </CardActions>
          </Card>
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
    <div aria-label="quick-assign-widget" tw="flex flex-auto space-x-2 items-center max-w-3xl">
      <div tw="w-full items-center flex-wrap">
        <MemberUpcomingTrackingItemList memberTrackingItems={memberTrackingItemsQuery.data} forMemberId={memberId} />
      </div>
    </div>
  );
};
