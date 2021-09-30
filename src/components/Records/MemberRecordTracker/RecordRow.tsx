import { MemberTrackingRecord, TrackingItem, User } from '@prisma/client';
import { Dayjs } from 'dayjs';
const dayjs = require('dayjs');
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { getCategory } from '../../../utils/Status';
import { ECategories, EMtrVerb } from '../../../types/global';
import { Token, TableData, TokenObj, TableRow } from '../TwinMacro/Twin';
import 'twin.macro';
import ConditionalDateInput from '../../../lib/ConditionalDateInput';
import { useUser } from '@tron/nextjs-auth-p1';
import { LoggedInUser } from '../../../repositories/userRepo';
import { useSnackbar } from 'notistack';
import ConfirmDialog from '../../Dialog/ConfirmDialog';
import { DialogContent, DialogTitle } from '../../../lib/ui';
import { getInterval } from '../../../utils/DaysToString';
import { useMemberTrackingRecord, useUpdateMemberTrackingRecord } from '../../../hooks/api/memberTrackingRecord';
import { RecordRowActions } from '../Actions/RecordSignature';
import { useMemberItemTrackerContext } from './providers/useMemberItemTrackerContext';

export type RecordWithTrackingItem = MemberTrackingRecord & {
  trackingItem: TrackingItem;
  status?: ECategories;
  authority: User;
};

const isFiltered = (categories: ECategories[], activeCategory: ECategories, status: ECategories) => {
  // fallback case to ensure the activeCategory is in the category array
  if (!categories.includes(activeCategory)) {
    return true;
  }

  // Filter statuses
  if (!categories.includes(status)) {
    return true;
  }
  // display all filter
  if (activeCategory !== ECategories.ALL) {
    if (activeCategory !== status) {
      return true;
    }
  }

  return false;
};

const RecordRowSkeleton = () => {
  return (
    <div role="skeleton" tw="border border-gray-300 ">
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
  const [modalState, setModalState] = useState({ open: false, date: null });

  const handleMutation = (date?: Dayjs) => {
    const memberTrackingRecord = {
      ...trackingRecordQuery.data,
      completedDate: date ?? modalState.date,
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
          enqueueSnackbar('Completion date Request failed', { variant: 'error' });
        },
      }
    );
  };

  const handleYes = () => {
    handleMutation();
    setModalState({ open: false, date: null });
  };

  const handleNo = () => {
    setModalState({ open: false, date: null });
  };

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

  if (!trackingRecordQuery || trackingRecordQuery.isLoading || !user) {
    return <RecordRowSkeleton />;
  }

  if (isFiltered(categories, activeCategory, status)) {
    return null;
  }

  const handleCompletionDateChange = (inputDate: Date) => {
    const date = dayjs(inputDate);
    if (trackingRecordQuery.data.authoritySignedDate || trackingRecordQuery.data.traineeSignedDate) {
      setModalState({ open: true, date });
    } else {
      handleMutation(date);
    }
  };

  const DynamicToken = TokenObj[status];
  return (
    <>
      <TableRow>
        <TableData tw={'font-size[16px] w-60 pt-1'}>
          <div tw={'flex'}>
            <DynamicToken />
            <div tw="whitespace-nowrap overflow-ellipsis overflow-hidden w-64">{trackingItem?.title}</div>
            {trackingRecordQuery.isLoading ? <div>...Loading</div> : null}
          </div>
        </TableData>
        <TableData tw={'text-purple-500 w-16 ml-10 pt-1'}>{getInterval(trackingItem?.interval)}</TableData>
        <div tw="flex justify-between">
          <TableData tw="flex space-x-1">
            <>
              <span tw={'opacity-40 pr-1 pt-1'}>Completed: </span>
              <span tw="pt-1">
                <ConditionalDateInput
                  onChange={handleCompletionDateChange}
                  condition={
                    !!trackingRecordQuery.data.authoritySignedDate && !!trackingRecordQuery.data.traineeSignedDate
                  }
                  dateValue={trackingRecordQuery.data.completedDate}
                />
              </span>
            </>
          </TableData>
          <TableData tw="space-x-1 pt-1">
            <>
              <span tw={'opacity-40'}>Due: </span>
              <span>
                {trackingRecordQuery.data?.completedDate
                  ? dayjs(trackingRecordQuery.data?.completedDate)
                      .add(trackingItem?.interval, 'days')
                      .format('DD MMM YY')
                  : 'No Date'}
              </span>
            </>
          </TableData>
        </div>
        <RecordRowActions
          memberTrackingRecord={trackingRecordQuery.data}
          authoritySignedDate={trackingRecordQuery.data.authoritySignedDate}
          traineeSignedDate={trackingRecordQuery.data.traineeSignedDate}
          disabled={!trackingRecordQuery.data.completedDate}
        />
      </TableRow>
      <ConfirmDialog open={modalState.open} handleNo={handleNo} handleYes={handleYes}>
        <DialogTitle>Proceed?</DialogTitle>
        <DialogContent>
          Changing the completion date will clear all signatures present. Are you sure you want to continue?
        </DialogContent>
      </ConfirmDialog>
    </>
  );
};

export default RecordRow;
