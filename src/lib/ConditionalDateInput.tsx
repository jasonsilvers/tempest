import dayjs from 'dayjs';
import React, { useState } from 'react';
import { DialogContent, DialogTitle, TempestDatePicker } from './ui';
import tw from 'twin.macro';
import { MemberTrackingRecord, TrackingItem, User } from '@prisma/client';
import { Dayjs } from 'dayjs';
import { useSnackbar } from 'notistack';
import ConfirmDialog from '../components/Dialog/ConfirmDialog';
import { EMtrVerb } from '../const/enums';
import { useUpdateMemberTrackingRecord } from '../hooks/api/memberTrackingRecord';
interface IConditionalDateInput {
  memberTrackingRecord: MemberTrackingRecord & { trackingItem: TrackingItem; trainee: User; authority: User };
}

const CompletedDate = tw.div`pt-1 w-32 text-gray-400`;

const ConditionalDateInput: React.FC<IConditionalDateInput> = ({ memberTrackingRecord }) => {
  const [modalState, setModalState] = useState({ open: false, date: null });
  const completionDate = useUpdateMemberTrackingRecord(EMtrVerb.UPDATE_COMPLETION);

  const { enqueueSnackbar } = useSnackbar();

  const dateValue = memberTrackingRecord.completedDate;

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

  const handleCompletionDateChange = (inputDate: Date) => {
    const date = dayjs(inputDate);
    if (memberTrackingRecord.authoritySignedDate || memberTrackingRecord.traineeSignedDate) {
      setModalState({ open: true, date });
    } else {
      handleMutation(date);
    }
  };

  const handleYesClearSignatures = () => {
    handleMutation();
    setModalState({ open: false, date: null });
  };

  const handleNoClearSignatures = () => {
    setModalState({ open: false, date: null });
  };

  if (!!memberTrackingRecord.authoritySignedDate && !!memberTrackingRecord.traineeSignedDate) {
    return <CompletedDate>{dayjs(dateValue).format('MMM D, YYYY')}</CompletedDate>;
  } else
    return (
      <>
        <TempestDatePicker
          onChange={handleCompletionDateChange}
          inputVariant="outlined"
          disableFuture
          autoOk
          value={dateValue ? dayjs(dateValue).format('MMM DD, YYYY') : null}
        />
        <ConfirmDialog open={modalState.open} handleNo={handleNoClearSignatures} handleYes={handleYesClearSignatures}>
          <DialogTitle>Proceed?</DialogTitle>
          <DialogContent>
            Changing the completion date will clear all signatures present. Are you sure you want to continue?
          </DialogContent>
        </ConfirmDialog>
      </>
    );
};

export default ConditionalDateInput;
