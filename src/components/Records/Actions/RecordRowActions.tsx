import { Button, IconButton, Zoom } from '@mui/material';
import { MemberTrackingItemStatus, MemberTrackingRecord, User } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import { OptionsObject, SnackbarKey, SnackbarMessage, useSnackbar } from 'notistack';
import React from 'react';
import { UseMutateFunction, useQueryClient } from 'react-query';
import 'twin.macro';
import { ArchiveIcon, DoneAllIcon } from '../../../assets/Icons';
import { EFuncAction, EMtrVariant, EMtrVerb, EResource, ERole } from '../../../const/enums';
import { mtiQueryKeys, useUpdateMemberTrackingItem } from '../../../hooks/api/memberTrackingItem';
import { useDeleteMemberTrackingRecord, useUpdateMemberTrackingRecord } from '../../../hooks/api/memberTrackingRecord';
import { usePermissions } from '../../../hooks/usePermissions';
import { LoadingSpinner, TempestDeleteIcon, TempestToolTip } from '../../../lib/ui';
import { LoggedInUser as LoggedInUserType } from '../../../repositories/userRepo';
import setDomRole from '../../../utils/setDomRole';
import { useMemberItemTrackerContext } from '../MemberRecordTracker/providers/useMemberItemTrackerContext';
import { ActionButton, DisabledButton, TableData } from '../TwinMacro/Twin';
import { RecordSignatureToolTip } from './RecordSignatureToolTip';
const dayjs = require('dayjs');

type DeterminedActionOnRecord = 'traineeCanSign' | 'authorityCanSign' | 'completed';

export const determineActionOnRecord = (
  signee: 'trainee' | 'authority',
  memberTrackingRecord: MemberTrackingRecord,
  signatureType: 'authoritySignedDate' | 'traineeSignedDate',
  loggedInUser: User
): DeterminedActionOnRecord => {
  let action: DeterminedActionOnRecord;
  if (!memberTrackingRecord[signatureType]) {
    if (signee === 'authority' && loggedInUser?.id !== memberTrackingRecord.traineeId) {
      action = 'authorityCanSign';
    }
    if (signee === 'trainee' && loggedInUser?.id === memberTrackingRecord.traineeId) {
      action = 'traineeCanSign';
    }
  }

  if (memberTrackingRecord[signatureType] && memberTrackingRecord[signee]) {
    action = 'completed';
  }

  return action;
};

const AwaitingSignature: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <TableData tw="text-xs mr-3">
    <DisabledButton tw="h-8" disabled>
      {children ?? 'Awaiting Signature'}
    </DisabledButton>
  </TableData>
);

const AwaitingSignatureSecondary: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <TableData tw="text-xs mr-3">
    <DisabledButton tw="h-8 text-secondary border-secondary" disabled>
      {children ?? 'Awaiting Signature'}
    </DisabledButton>
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
  memberTrackingRecord: MemberTrackingRecord,
  signatureType: 'authoritySignedDate' | 'traineeSignedDate',
  loggedInUser: User,
  signRecordFor: UseMutateFunction<
    MemberTrackingRecord,
    unknown,
    { memberTrackingRecord: MemberTrackingRecord; userId: number }
  >,
  enqueueSnackbar: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey
) => {
  // fail back if the signatureOwner:User is false
  // would indicate data is still fetching
  if (!loggedInUser) {
    return 'Fetching Data...';
  }

  const handleSign = () => {
    signRecordFor(
      { memberTrackingRecord, userId: memberTrackingRecord.traineeId },
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
        <ActionButton tw="h-8 hover:bg-primary" aria-label={setDomRole('Signature Button')} onClick={handleSign}>
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
            <DisabledButton tw="text-xs h-8 border-0 text-secondarytext">{`Signed On ${dayjs(
              memberTrackingRecord[signatureType]
            ).format('MM/DD/YY')}`}</DisabledButton>
          </span>
        </RecordSignatureToolTip>
      </TableData>
    );
  }

  return (
    <>
      {memberTrackingRecord.traineeSignedDate || memberTrackingRecord.authoritySignedDate ? (
        <AwaitingSignatureSecondary />
      ) : (
        <AwaitingSignature />
      )}
    </>
  );
};

const ArchiveActions: React.FC<{
  isMonitor: boolean;
  memberTrackingRecord: MemberTrackingRecord & { trainee: User; authority: User };
}> = ({ isMonitor, memberTrackingRecord }) => {
  const { mutate: updateMemberTrackingItem } = useUpdateMemberTrackingItem();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { variant } = useMemberItemTrackerContext();

  if (!isMonitor) {
    return null;
  }

  return (
    <>
      {variant === EMtrVariant.COMPLETED ? (
        <IconButton
          aria-label={`archive-tracking-record-${memberTrackingRecord.id}`}
          size="small"
          color="secondary"
          onClick={() =>
            updateMemberTrackingItem(
              {
                updatedMemberTrackingItem: { status: MemberTrackingItemStatus.INACTIVE },
                trackingItemId: memberTrackingRecord.trackingItemId,
                userId: memberTrackingRecord.traineeId,
              },
              {
                onSuccess: () => {
                  enqueueSnackbar('Record successfully archived', { variant: 'success' });
                },
                onError: () => {
                  console.log('error with archiving');
                },
                onSettled: (data) => {
                  queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItems(data.userId, EMtrVariant.COMPLETED));
                },
              }
            )
          }
          tw="hover:bg-transparent"
        >
          <ArchiveIcon />
        </IconButton>
      ) : (
        <Button
          onClick={() =>
            updateMemberTrackingItem(
              {
                updatedMemberTrackingItem: { status: MemberTrackingItemStatus.ACTIVE },
                trackingItemId: memberTrackingRecord.trackingItemId,
                userId: memberTrackingRecord.traineeId,
              },
              {
                onSuccess: () => {
                  enqueueSnackbar('Record successfully unarchived', { variant: 'success' });
                },
                onError: () => {
                  console.log('error with unarchiving');
                },
                onSettled: (data) => {
                  queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItems(data.userId, EMtrVariant.ARCHIVED));
                },
              }
            )
          }
        >
          UNARCHIVE
        </Button>
      )}
    </>
  );
};

const RecordRowActions: React.FC<{
  authoritySignedDate: Date;
  traineeSignedDate: Date;
  memberTrackingRecord: MemberTrackingRecord & { trainee: User; authority: User };
  disabled: boolean;
}> = ({ authoritySignedDate, traineeSignedDate, memberTrackingRecord, disabled }) => {
  const { user: LoggedInUser } = useUser<LoggedInUserType>();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate: signTrainee } = useUpdateMemberTrackingRecord(EMtrVerb.SIGN_TRAINEE);
  const { mutate: signAuthority } = useUpdateMemberTrackingRecord(EMtrVerb.SIGN_AUTHORITY);

  const { mutate: deleteRecord } = useDeleteMemberTrackingRecord();

  const { trainee, authority } = memberTrackingRecord;
  const { isLoading, permissionCheck } = usePermissions();

  const determineActionForAuthority = determineActionOnRecord(
    'authority',
    memberTrackingRecord,
    'authoritySignedDate',
    LoggedInUser
  );
  const determineActionForTrainee = determineActionOnRecord(
    'trainee',
    memberTrackingRecord,
    'traineeSignedDate',
    LoggedInUser
  );

  const canDeleteAny = permissionCheck(
    LoggedInUser?.role?.name,
    EFuncAction.DELETE_ANY,
    EResource.MEMBER_TRACKING_RECORD
  );

  const isAdmin = LoggedInUser?.role?.name === ERole.ADMIN;
  const isMonitor = LoggedInUser?.role?.name === ERole.MONITOR;

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
            {determineActionForAuthority === 'authorityCanSign' ? (
              <TableData tw="text-xs mr-3">
                <DisabledButton tw="h-8 bg-gray-300 text-disabledText border-0 text-[14px]" disabled>
                  Sign
                </DisabledButton>
              </TableData>
            ) : (
              <AwaitingSignature />
            )}
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
            {determineActionForTrainee === 'traineeCanSign' ? (
              <TableData tw="text-xs mr-3">
                <DisabledButton tw="h-8 bg-gray-300 text-disabledText border-0 text-[14px]" disabled>
                  Sign
                </DisabledButton>
              </TableData>
            ) : (
              <AwaitingSignature />
            )}
          </span>
        </TempestToolTip>
        <TableData>
          <IconButton
            aria-label={`delete-tracking-record-${memberTrackingRecord.id}`}
            size="small"
            onClick={() =>
              deleteRecord({ memberTrackingRecordId: memberTrackingRecord.id, userId: memberTrackingRecord.traineeId })
            }
            tw="ml-auto mr-3 hover:bg-transparent"
          >
            <TempestDeleteIcon />
          </IconButton>
        </TableData>
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        <LoadingSpinner />
      </>
    );
  }

  if (authoritySignedDate && traineeSignedDate) {
    return (
      <>
        <TableData tw="ml-auto color['#7B7B7B'] opacity-60 pr-10 w-52">
          <RecordSignatureToolTip
            traineeSignature={{ signee: trainee, date: memberTrackingRecord.authoritySignedDate }}
            authoritySignature={{ signee: authority, date: memberTrackingRecord.traineeSignedDate }}
          >
            <div>
              Signatures Present <DoneAllIcon tw="ml-3 color['#DADADA']" />
            </div>
          </RecordSignatureToolTip>
        </TableData>
        <TableData tw="w-28 flex">
          <div tw="ml-auto">
            <ArchiveActions isMonitor={isMonitor} memberTrackingRecord={memberTrackingRecord} />
            {isAdmin && (
              <IconButton
                aria-label={`delete-tracking-record-${memberTrackingRecord.id}`}
                size="small"
                onClick={() =>
                  deleteRecord({
                    memberTrackingRecordId: memberTrackingRecord.id,
                    userId: memberTrackingRecord.traineeId,
                  })
                }
                tw="hover:bg-transparent"
              >
                <TempestDeleteIcon />
              </IconButton>
            )}
          </div>
        </TableData>
      </>
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
          onClick={() =>
            deleteRecord({ memberTrackingRecordId: memberTrackingRecord.id, userId: memberTrackingRecord.traineeId })
          }
          tw="ml-auto mr-3 hover:bg-transparent"
        >
          <TempestDeleteIcon />
        </IconButton>
      </TableData>
    </div>
  );
};

export { RecordRowActions };
