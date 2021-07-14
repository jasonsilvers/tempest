import { MemberTrackingRecord, TrackingItem, User } from '@prisma/client';
import dayjs from 'dayjs';
import React, { ChangeEvent, useLayoutEffect, useMemo } from 'react';
import { useMemberTrackingRecord, useUpdateMemberTrackingRecord } from '../../hooks/api/memberTrackingRecord';
import { getCategory } from '../../utils/Status';
import { ECategories, EMtrVerb } from '../../types/global';
import { useMemberItemTrackerContext } from './MemberRecordTracker';
import RecordSignature from './RecordSignature';
import { Token, TableData, TokenObj, TableRow } from './TwinMacro/Twin';
import 'twin.macro';
import ConditionalDateInput from '../../lib/ConditionalDateInput';
import { useUser } from '@tron/nextjs-auth-p1';
import { LoggedInUser } from '../../repositories/userRepo';
import { useSnackbar } from 'notistack';

export type RecordWithTrackingItem = MemberTrackingRecord & {
  trackingItem: TrackingItem;
  status?: ECategories;
  authority: User;
};

// object to get common text for amount of days
const daysToString = {
  7: 'Weekly',
  14: 'Bi-Weekly',
  30: 'Monthly',
  31: 'Monthly',
  90: 'Quarter',
  180: 'Semi-Annual',
  365: 'Annual',
};

const RecordRowSkeleton = () => {
  return (
    <div tw="border border-gray-300 ">
      <div tw="animate-pulse flex h-12 justify-items-center items-center px-2">
        <Token tw="bg-gray-400 pr-2" />
        <div tw="h-4 w-40 bg-gray-400 rounded-sm"></div>
        <div tw="ml-auto flex space-x-4">
          <div tw="h-2 w-14 bg-gray-400"></div>
          <div tw="h-2 w-14 bg-gray-400"></div>
          <div tw="h-2 w-14 bg-gray-400"></div>
          <div tw="h-2 w-14 bg-gray-400"></div>
        </div>
      </div>
    </div>
  );
};

const RecordRow: React.FC<{
  memberTrackingRecordId: number;
  trackingItem: TrackingItem;
}> = ({ memberTrackingRecordId, trackingItem }) => {
  const { activeCategory, increaseCategoryCount, categories } = useMemberItemTrackerContext();
  const trackingRecordQuery = useMemberTrackingRecord(memberTrackingRecordId);
  const completionDate = useUpdateMemberTrackingRecord(EMtrVerb.UPDATE_COMPLETION);
  const { user } = useUser<LoggedInUser>();
  const { enqueueSnackbar } = useSnackbar();

  // increase count
  useLayoutEffect(() => {
    if (trackingRecordQuery.data) {
      increaseCategoryCount(getCategory(trackingRecordQuery.data, trackingItem?.interval));
    }
  }, [trackingRecordQuery.data]);

  const status = useMemo(() => {
    if (trackingRecordQuery.data) {
      return getCategory(trackingRecordQuery.data, trackingItem?.interval);
    }
  }, [trackingRecordQuery.data, trackingItem?.interval]);

  if (!trackingRecordQuery || trackingRecordQuery.isLoading) {
    return <RecordRowSkeleton />;
  }

  // fallback case to ensure the activeCategory is in the category array
  if (!categories.includes(activeCategory)) {
    return null;
  }

  // Filter statuses
  if (!categories.includes(status)) {
    return null;
  }
  // display all filter
  if (activeCategory !== ECategories.ALL) {
    if (activeCategory !== status) {
      return null;
    }
  }

  const handleCompletionDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const date = dayjs(event.target.value);
    const memberTrackingRecord = {
      ...trackingRecordQuery.data,
      completedDate: date.toDate(),
    };
    completionDate.mutate(
      { memberTrackingRecord, userId: user.id },
      {
        onSettled: async () => {
          enqueueSnackbar('Completion date updated, Signatures cleared', { variant: 'success' });
        },
        // currently not firing onError.
        // see https://react-query.tanstack.com/guides/mutations#mutation-side-effects for doc on how it should work.
        onError: async () => {
          console.log(`options onError -- error while updating completion date`);
          enqueueSnackbar('Completion date Request failed', { variant: 'error' });
        },
      }
    );
  };

  const DynamicToken = TokenObj[status];
  return (
    <TableRow>
      <TableData tw={'font-size[16px] overflow-ellipsis w-72'}>
        <div tw={'flex'}>
          <DynamicToken />
          {trackingItem?.title}
          {trackingRecordQuery.isLoading ? <div>...Loading</div> : null}
        </div>
      </TableData>
      <TableData tw={'text-purple-500 w-20 ml-10'}>
        {/* get the common text for number of days if exits else render '## days' */}
        {daysToString[trackingItem?.interval] ?? `${trackingItem?.interval} days`}
      </TableData>
      <div tw="flex justify-between">
        <TableData tw="flex space-x-1">
          <>
            <span tw={'opacity-40'}>Completed: </span>
            <ConditionalDateInput
              onChange={handleCompletionDateChange}
              condition={!!trackingRecordQuery.data.authoritySignedDate && !!trackingRecordQuery.data.traineeSignedDate}
              dateValue={trackingRecordQuery.data.completedDate}
            />
          </>
        </TableData>
        <TableData tw="w-52 space-x-1">
          <>
            <span tw={'opacity-40'}>Due: </span>
            <span>
              {dayjs(trackingRecordQuery.data?.completedDate).add(trackingItem?.interval, 'days').format('DD MMM YY')}
            </span>
          </>
        </TableData>
      </div>
      <RecordSignature
        memberTrackingRecord={trackingRecordQuery.data}
        authoritySignedDate={trackingRecordQuery.data.authoritySignedDate}
        traineeSignedDate={trackingRecordQuery.data.traineeSignedDate}
        disabled={!trackingRecordQuery.data.completedDate}
      />
    </TableRow>
  );
};

/**
 * For later
 */
//<CircularProgress tw="ml-2" size={18} />
/*

*/

export default RecordRow;
