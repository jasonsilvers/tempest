import { MemberTrackingRecord, User } from '@prisma/client';
const dayjs = require('dayjs');
import { SnackbarMessage, OptionsObject, SnackbarKey, useSnackbar } from 'notistack';
import React from 'react';
import { UseMutateFunction } from 'react-query';
import 'twin.macro';
import { useUser } from '@tron/nextjs-auth-p1';

import RecordSignatureToolTip from './RecordSignatureToolTip';
import { DoneAllIcon } from '../../../assets/Icons';
import { useUpdateMemberTrackingRecord } from '../../../hooks/api/memberTrackingRecord';
import { usePermissions } from '../../../hooks/usePermissions';
import { MemberTrackingRecordWithUsers } from '../../../repositories/memberTrackingRepo';
import { EMtrVerb, EFuncAction, EResource } from '../../../types/global';
import setDomRole from '../../../utils/SetDomRole';
import { TableData, DisabledButton, ActionButton } from '../TwinMacro/Twin';
import { LoggedInUser as LoggedInUserType } from '../../../repositories/userRepo';

const AwaitingSignature: React.FC = ({ children }) => (
  <TableData tw="mr-3">
    <DisabledButton disabled>{children ?? 'Awaiting Signature'}</DisabledButton>
  </TableData>
);

/**
 * Function to determine render for the Trainee Signature Block
 *
 * @param signatureDate   -- required to create the signature
 * @param signatureOwner  -- required to create the signature
 * @param loggedInUserId  -- required to render the signature button for the correct user
 * @returns
 */

const getSignature = (
  signee: 'trainee' | 'authority',
  memberTrackingRecord: MemberTrackingRecordWithUsers,
  signatureType: 'authoritySignedDate' | 'traineeSignedDate',
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
          enqueueSnackbar('A record was successfully Signed', { variant: 'success' });
        },
        onError: () => {
          console.log('error with signature');
        },
      }
    );
  };

  // if signature date is false and
  // user logged in is the signature owner
  // render button to sign
  if (
    !memberTrackingRecord[signatureType] &&
    ((signee === 'authority' && loggedInUser.id !== memberTrackingRecord.traineeId) ||
      (signee === 'trainee' && loggedInUser.id === memberTrackingRecord.traineeId))
  ) {
    return (
      <TableData>
        <ActionButton aria-label={setDomRole('Signature Button')} onClick={handleSignTrainee}>
          Sign
        </ActionButton>
      </TableData>
    );
  }
  // if signature date is true and signature owner is true
  // render signature based on the signature owner and date
  if (memberTrackingRecord[signatureType] && memberTrackingRecord[signee]) {
    return (
      <TableData>
        <RecordSignatureToolTip
          traineeSignature={{ signee: memberTrackingRecord[signee], date: memberTrackingRecord[signatureType] }}
        >
          <span>
            <DisabledButton>{`Signed On ${dayjs(memberTrackingRecord[signatureType]).format(
              'MM/DD/YY'
            )}`}</DisabledButton>
          </span>
        </RecordSignatureToolTip>
      </TableData>
    );
  }

  return <AwaitingSignature />;
};

const RecordSignature: React.FC<{
  authoritySignedDate: Date;
  traineeSignedDate: Date;
  memberTrackingRecord: MemberTrackingRecordWithUsers;
  disabled: boolean;
}> = ({ authoritySignedDate, traineeSignedDate, memberTrackingRecord, disabled }) => {
  const { user: LoggedInUser } = useUser<LoggedInUserType>();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate: signTrainee } = useUpdateMemberTrackingRecord(EMtrVerb.SIGN_TRAINEE);
  const { mutate: signAuthority } = useUpdateMemberTrackingRecord(EMtrVerb.SIGN_AUTHORITY);
  const { trainee, authority } = memberTrackingRecord;
  const { permissionCheck, isLoading } = usePermissions();

  const permission = permissionCheck(LoggedInUser.role.name, EFuncAction.UPDATE_ANY, EResource.MEMBER_TRACKING_RECORD);

  if (disabled) {
    return null;
  }

  if (isLoading) {
    return <></>;
  }

  const canSignAuthority = permission.granted && memberTrackingRecord.traineeId !== LoggedInUser.id;

  if (authoritySignedDate && traineeSignedDate) {
    return (
      <TableData tw="ml-auto color['#7B7B7B'] opacity-60">
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
      {canSignAuthority ? (
        getSignature(
          'authority',
          memberTrackingRecord,
          'authoritySignedDate',
          LoggedInUser,
          signAuthority,
          enqueueSnackbar
        )
      ) : (
        <AwaitingSignature />
      )}
      {getSignature('trainee', memberTrackingRecord, 'traineeSignedDate', LoggedInUser, signTrainee, enqueueSnackbar)}
    </div>
  );
};

export default RecordSignature;
