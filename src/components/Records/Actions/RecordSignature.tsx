import { MemberTrackingRecord, User } from '@prisma/client';
const dayjs = require('dayjs');
import { SnackbarMessage, OptionsObject, SnackbarKey, useSnackbar } from 'notistack';
import React from 'react';
import { UseMutateFunction } from 'react-query';
import 'twin.macro';
import { useUser } from '@tron/nextjs-auth-p1';

import RecordSignatureToolTip from './RecordSignatureToolTip';
import { DoneAllIcon } from '../../../assets/Icons';
import { useDeleteMemberTrackingRecord, useUpdateMemberTrackingRecord } from '../../../hooks/api/memberTrackingRecord';
import { usePermissions } from '../../../hooks/usePermissions';
import { MemberTrackingRecordWithUsers } from '../../../repositories/memberTrackingRepo';
import { EFuncAction, EMtrVerb, EResource } from '../../../types/global';
import setDomRole from '../../../utils/SetDomRole';
import { TableData, DisabledButton, ActionButton } from '../TwinMacro/Twin';
import { LoggedInUser as LoggedInUserType } from '../../../repositories/userRepo';
import { IconButton, TempestDeleteIcon, TempestToolTip, Zoom } from '../../../lib/ui';

type DeterminedActionOnRecord = 'traineeCanSign' | 'authorityCanSign' | 'completed';

export const determineActionOnRecord = (
  signee: 'trainee' | 'authority',
  memberTrackingRecord: MemberTrackingRecordWithUsers,
  signatureType: 'authoritySignedDate' | 'traineeSignedDate',
  loggedInUser: User
): DeterminedActionOnRecord => {
  let action: DeterminedActionOnRecord;
  if (!memberTrackingRecord[signatureType]) {
    if (signee === 'authority' && loggedInUser.id !== memberTrackingRecord.traineeId) {
      action = 'authorityCanSign';
    }
    if (signee === 'trainee' && loggedInUser.id === memberTrackingRecord.traineeId) {
      action = 'traineeCanSign';
    }
  }

  if (memberTrackingRecord[signatureType] && memberTrackingRecord[signee]) {
    action = 'completed';
  }

  return action;
};

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

const getAllowedActions = (
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

  const determinedAction = determineActionOnRecord(signee, memberTrackingRecord, signatureType, loggedInUser);

  // if signature date is false and
  // user logged in is the signature owner
  // render button to sign
  if (determinedAction === 'authorityCanSign' || determinedAction === 'traineeCanSign') {
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
  if (determinedAction === 'completed') {
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

const RecordRowActions: React.FC<{
  authoritySignedDate: Date;
  traineeSignedDate: Date;
  memberTrackingRecord: MemberTrackingRecordWithUsers;
  disabled: boolean;
}> = ({ authoritySignedDate, traineeSignedDate, memberTrackingRecord, disabled }) => {
  const { user: LoggedInUser } = useUser<LoggedInUserType>();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate: signTrainee } = useUpdateMemberTrackingRecord(EMtrVerb.SIGN_TRAINEE);
  const { mutate: signAuthority } = useUpdateMemberTrackingRecord(EMtrVerb.SIGN_AUTHORITY);
  const { mutate: deleteRecord } = useDeleteMemberTrackingRecord();

  const { trainee, authority } = memberTrackingRecord;
  const { isLoading, permissionCheck } = usePermissions();

  const canDeleteAny = permissionCheck(
    LoggedInUser?.role?.name,
    EFuncAction.DELETE_ANY,
    EResource.MEMBER_TRACKING_RECORD
  );

  if (disabled) {
    return (
      <div tw="flex ml-auto">
        <TempestToolTip
          arrow
          placement={'top-start'}
          TransitionComponent={Zoom}
          TransitionProps={{ timeout: 300 }}
          title={'No Completed Date'}
        >
          <span>
            <AwaitingSignature />
          </span>
        </TempestToolTip>
        <TempestToolTip
          arrow
          placement={'top-start'}
          TransitionComponent={Zoom}
          TransitionProps={{ timeout: 300 }}
          title={'No Completed Date'}
        >
          <span>
            <AwaitingSignature />
          </span>
        </TempestToolTip>
        <TableData>
          <IconButton
            aria-label={`delete-tracking-record-${memberTrackingRecord.id}`}
            size="small"
            onClick={() => deleteRecord(memberTrackingRecord.id)}
            tw="ml-auto mr-3 hover:bg-transparent"
          >
            <TempestDeleteIcon />
          </IconButton>
        </TableData>
      </div>
    );
  }

  if (isLoading) {
    return <></>;
  }

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
      {getAllowedActions(
        'authority',
        memberTrackingRecord,
        'authoritySignedDate',
        LoggedInUser,
        signAuthority,
        enqueueSnackbar
      )}
      {getAllowedActions(
        'trainee',
        memberTrackingRecord,
        'traineeSignedDate',
        LoggedInUser,
        signTrainee,
        enqueueSnackbar
      )}

      <TableData>
        <IconButton
          disabled={
            !canDeleteAny.granted &&
            determineActionOnRecord('authority', memberTrackingRecord, 'authoritySignedDate', LoggedInUser) ===
              'completed'
          }
          aria-label={`delete-tracking-record-${memberTrackingRecord.id}`}
          size="small"
          onClick={() => deleteRecord(memberTrackingRecord.id)}
          tw="ml-auto mr-3 hover:bg-transparent"
        >
          <TempestDeleteIcon />
        </IconButton>
      </TableData>
    </div>
  );
};

export { RecordRowActions };
