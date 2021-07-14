import { MemberTrackingRecord, User } from '@prisma/client';
import dayjs from 'dayjs';
import { SnackbarMessage, OptionsObject, SnackbarKey, useSnackbar } from 'notistack';
import React from 'react';
import { UseMutateFunction } from 'react-query';
import 'twin.macro';
import setDomRole from '../../utils/SetDomRole';
import { CircularProgress } from '../../lib/ui';
import { DoneAllIcon } from '../../assets/Icons';
import { useUser } from '@tron/nextjs-auth-p1';
import { useUpdateMemberTrackingRecord } from '../../hooks/api/memberTrackingRecord';
import { LoggedInUser as LoggedInUserType } from '../../repositories/userRepo';
import { ActionButton, DisabledButton, TableData } from './TwinMacro/Twin';

import RecordSignatureToolTip from './RecordSignatureToolTip';
import { MemberTrackingRecordWithUsers } from '../../repositories/memberTrackingRepo';
import { EMtrVerb } from '../../types/global';

/**
 * Function to determine render for the Trainee Signature Block
 *
 * @param signatureDate   -- required to create the signature
 * @param signatureOwner  -- required to create the signature
 * @param loggedInUserId  -- required to render the signature button for the correct user
 * @returns
 */

const getTraineeSignature = (
  memberTrackingRecord: MemberTrackingRecordWithUsers,
  signatureDate: Date,
  loggedInUser: User,
  signRecordFor: UseMutateFunction<
    MemberTrackingRecord,
    unknown,
    { memberTrackingRecord: MemberTrackingRecord; userId: string }
  >,
  enqueueSnackbar: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey
) => {
  // fail back if the signatureOwner:User is false
  // would indicate data is still fetching
  if (!loggedInUser) {
    return 'Fetching Data...';
  }

  const handleSignTrainee = () => {
    signRecordFor(
      { memberTrackingRecord, userId: loggedInUser.id },
      {
        onSuccess: () => {
          enqueueSnackbar('A record was successfully addded', { variant: 'success' });
        },
      }
    );
  };

  // if signature date is false and
  // user logged in is the signature owner
  // render button to sign
  if (!signatureDate && memberTrackingRecord?.traineeId === loggedInUser?.id) {
    return (
      <TableData tw="mr-6 align-middle">
        <ActionButton role={setDomRole('Signature Button')} onClick={handleSignTrainee}>
          Sign
        </ActionButton>
      </TableData>
    );
  }
  // if signature date is true and signature owner is true
  // render signature based on the signature owner and date
  if (loggedInUser) {
    return (
      <TableData tw="mr-6 align-middle">
        <RecordSignatureToolTip
          traineeSignature={{ signee: memberTrackingRecord.trainee, date: memberTrackingRecord.traineeSignedDate }}
        >
          <DisabledButton>{`Signed On ${dayjs(memberTrackingRecord.traineeSignedDate).format(
            'DD/MM/YY'
          )}`}</DisabledButton>
        </RecordSignatureToolTip>
      </TableData>
    );
  }
};

const RecordSignature: React.FC<{
  authoritySignedDate: Date;
  traineeSignedDate: Date;
  memberTrackingRecord: MemberTrackingRecordWithUsers;
}> = ({ authoritySignedDate, traineeSignedDate, memberTrackingRecord }) => {
  const { user: LoggedInUser } = useUser<LoggedInUserType>();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate, isLoading } = useUpdateMemberTrackingRecord(EMtrVerb.SIGN_TRAINEE);
  const { trainee, authority } = memberTrackingRecord;
  if (isLoading && !traineeSignedDate) {
    return <CircularProgress tw="ml-2" size={18} />;
  }

  if (authoritySignedDate && traineeSignedDate) {
    return (
      <TableData tw="ml-auto mr-20 color['#7B7B7B'] opacity-60">
        <RecordSignatureToolTip
          traineeSignature={{ signee: trainee, date: memberTrackingRecord.authoritySignedDate }}
          authoritySignature={{ signee: authority, date: memberTrackingRecord.traineeSignedDate }}
        >
          <div>
            Signatures Present <DoneAllIcon tw="ml-3 color['#DADADA']" />
          </div>
        </RecordSignatureToolTip>
      </TableData>
    );
  }
  return (
    <div tw="flex ml-auto">
      <TableData tw="mr-3">
        <DisabledButton>Awaiting Signature</DisabledButton>
      </TableData>
      {getTraineeSignature(memberTrackingRecord, traineeSignedDate, LoggedInUser, mutate, enqueueSnackbar)}
    </div>
  );
};

export default RecordSignature;
