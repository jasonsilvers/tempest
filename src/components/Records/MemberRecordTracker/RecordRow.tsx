import { Popover, Typography } from '@mui/material';
import { MemberTrackingRecord, TrackingItem, User } from '@prisma/client';
import dayjs, { Dayjs } from 'dayjs';
import { useSnackbar } from 'notistack';
import React, { useMemo, useState } from 'react';
import 'twin.macro';
import { ECategories, EMtrVerb } from '../../../const/enums';
import { useUpdateMemberTrackingRecord } from '../../../hooks/api/memberTrackingRecord';
import ConditionalDateInput from '../../../lib/ConditionalDateInput';
import { DialogContent, DialogTitle } from '../../../lib/ui';
import { TrackingItemInterval } from '../../../utils/daysToString';
import { getCategory } from '../../../utils/status';
import ConfirmDialog from '../../Dialog/ConfirmDialog';
import { RecordRowActions } from '../Actions/RecordSignature';
import { TableData, TableRow, TokenObj } from '../TwinMacro/Twin';
import { useMemberItemTrackerContext } from './providers/useMemberItemTrackerContext';

const DueDate = ({ completedDate, interval }: { completedDate: Date; interval: number }) => {
  if (interval === 0) {
    return <span>N/A</span>;
  }

  return <span>{completedDate ? dayjs(completedDate).add(interval, 'days').format('MMM D, YYYY') : 'No Date'}</span>;
};

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

const TrainingTitle = ({ title, description }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div>
      <Typography
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {title}
      </Typography>
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: 'none',
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Typography sx={{ p: 1 }}>{description}</Typography>
      </Popover>
    </div>
  );
};

const RecordRow: React.FC<{
  memberTrackingRecord: MemberTrackingRecord & { trackingItem: TrackingItem; trainee: User; authority: User };
  trackingItem: TrackingItem;
}> = ({ memberTrackingRecord, trackingItem }) => {
  const { activeCategory, categories } = useMemberItemTrackerContext();
  const completionDate = useUpdateMemberTrackingRecord(EMtrVerb.UPDATE_COMPLETION);

  const { enqueueSnackbar } = useSnackbar();
  const [modalState, setModalState] = useState({ open: false, date: null });

  const handleMutation = (date?: Dayjs) => {
    if (date && !date.isValid()) {
      return;
    }

    if (date && date?.toISOString() === memberTrackingRecord.completedDate?.toString()) {
      return;
    }

    const updatedMemberTrackingRecord = {
      ...memberTrackingRecord,
      completedDate: date ?? modalState.date,
    };
    completionDate.mutate(
      { memberTrackingRecord: updatedMemberTrackingRecord, userId: memberTrackingRecord.traineeId },
      {
        onSettled: async () => {
          enqueueSnackbar('Completion date updated', { variant: 'success' });
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

  const status = useMemo(() => {
    if (memberTrackingRecord) {
      return getCategory(memberTrackingRecord, trackingItem?.interval);
    }
  }, [memberTrackingRecord, trackingItem?.interval]);

  const handleCompletionDateChange = (inputDate: Date) => {
    const date = dayjs(inputDate);
    if (memberTrackingRecord.authoritySignedDate || memberTrackingRecord.traineeSignedDate) {
      setModalState({ open: true, date });
    } else {
      handleMutation(date);
    }
  };
  if (isFiltered(categories, activeCategory, status)) {
    return null;
  }

  const DynamicStatus = TokenObj[status];
  return (
    <>
      <TableRow>
        <TableData tw={'text-base w-1/3'}>
          <div tw={'flex'}>
            <div tw="pt-1">
              <DynamicStatus />
            </div>
            <div tw="whitespace-nowrap overflow-ellipsis overflow-hidden pt-[2px] text-secondary underline">
              <TrainingTitle title={trackingItem?.title} description={trackingItem?.description} />
            </div>
          </div>
        </TableData>
        <TableData tw={'text-sm w-24 pt-1'}>{TrackingItemInterval[trackingItem?.interval]}</TableData>
        <div tw="flex justify-between">
          <TableData tw="flex space-x-1">
            <ConditionalDateInput
              onChange={handleCompletionDateChange}
              condition={!!memberTrackingRecord.authoritySignedDate && !!memberTrackingRecord.traineeSignedDate}
              dateValue={memberTrackingRecord.completedDate}
            />
          </TableData>
          <TableData tw="space-x-1 pt-1 text-gray-400">
            <DueDate completedDate={memberTrackingRecord.completedDate} interval={trackingItem.interval} />
          </TableData>
        </div>
        <RecordRowActions
          memberTrackingRecord={memberTrackingRecord}
          authoritySignedDate={memberTrackingRecord.authoritySignedDate}
          traineeSignedDate={memberTrackingRecord.traineeSignedDate}
          disabled={!memberTrackingRecord.completedDate}
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
