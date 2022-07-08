import { Typography, Modal, Box, IconButton } from '@mui/material';
import { MemberTrackingRecord, TrackingItem, User } from '@prisma/client';
import dayjs, { Dayjs } from 'dayjs';
import { useSnackbar } from 'notistack';
import React, { useMemo, useState } from 'react';
import 'twin.macro';
import { Close } from '../../../assets/Icons';
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

const TrainingTitle = ({ title, description, location, completedDate, recurrence }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const date = dayjs(completedDate).format('MM/DD/YYYY');
  const handleModalOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleModalClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const boxStyle = {
    width: '828px',
    height: '286px',
    bgcolor: 'background.paper',
    border: '1px solid #B8B8B8',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    p: 4,
    borderRadius: '15px',
  };

  return (
    <div>
      <Typography
        tw="cursor-pointer"
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        onClick={handleModalOpen}
      >
        {title}
      </Typography>
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={boxStyle}>
          <IconButton
            onClick={handleModalClose}
            aria-label="dialog-close-button"
            color="secondary"
            tw="float-right justify-center"
          >
            <Close />
          </IconButton>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            {title}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2, fontSize: 14, color: '#00000099' }}>
            Training Description
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2, fontSize: 14 }}>
            {description ? description : 'None'}
          </Typography>
          <div tw="h-2/5 flex flex-row justify-around items-center gap-6">
            <Typography tw="text-sm">
              {recurrence ? (
                <span>
                  <b>Recurrence:</b> {`${recurrence}`}
                </span>
              ) : (
                <span>
                  <b>Recurrence:</b> N/A{' '}
                </span>
              )}
            </Typography>
            <Typography tw="text-sm">
              {location ? (
                <span>
                  <b>Location:</b> {`${location}`}
                </span>
              ) : (
                <span>
                  <b>Location:</b> None
                </span>
              )}
            </Typography>
            <Typography tw="text-sm">
              {completedDate ? (
                <span>
                  <b>Completed Date:</b> {`${date}`}
                </span>
              ) : (
                <span>
                  <b>Completed Date:</b> No Date
                </span>
              )}
            </Typography>
          </div>
        </Box>
      </Modal>
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
        <TableData tw={'text-base w-1/4'}>
          <div tw={'flex'}>
            <div tw="pt-1">
              <DynamicStatus />
            </div>
            <div tw="whitespace-nowrap overflow-ellipsis overflow-hidden pt-[2px] text-secondary underline">
              <TrainingTitle
                title={trackingItem?.title}
                description={trackingItem?.description}
                location={trackingItem?.location}
                completedDate={memberTrackingRecord.completedDate}
                recurrence={TrackingItemInterval[trackingItem?.interval]}
              />
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
