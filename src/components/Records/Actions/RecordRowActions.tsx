import { Button, Fade, IconButton, Paper, Popper, Typography, Zoom } from '@mui/material';
import { MemberTrackingItemStatus, MemberTrackingRecord, TrackingItemStatus, User } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import { OptionsObject, SnackbarKey, SnackbarMessage, useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { UseMutateFunction, useQueryClient } from 'react-query';
import 'twin.macro';
import { ArchiveIcon, DoneAllIcon, LockIcon } from '../../../assets/Icons';
import { EFuncAction, EMtrVariant, EMtrVerb, EResource, ERole } from '../../../const/enums';
import { mtiQueryKeys, useUpdateMemberTrackingItem } from '../../../hooks/api/memberTrackingItem';
import { useDeleteMemberTrackingRecord, useUpdateMemberTrackingRecord } from '../../../hooks/api/memberTrackingRecord';
import { usePermissions } from '../../../hooks/usePermissions';
import { LoadingSpinner, TempestDeleteIcon, TempestToolTip } from '../../../lib/ui';
import { MemberTrackingItemWithAll } from '../../../repositories/memberTrackingRepo';
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

  //Check if the record is signed
  if (!memberTrackingRecord[signatureType]) {
    //If it's not signed and the signee is a monitor and it's not their record allow signature
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

const UnArchiveActions: React.FC<{
  memberTrackingRecord: MemberTrackingRecord & { trainee: User; authority: User };
}> = ({ memberTrackingRecord }) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLSpanElement | null>(null);
  const { mutate: updateMemberTrackingItem } = useUpdateMemberTrackingItem();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const memberTrackingItemsQueryData = queryClient.getQueriesData<MemberTrackingItemWithAll[]>(
    mtiQueryKeys.memberTrackingItems(memberTrackingRecord.traineeId, EMtrVariant.ARCHIVED)
  );

  let memberTrackingItem: MemberTrackingItemWithAll;

  if (memberTrackingItemsQueryData[0]?.[1]) {
    memberTrackingItem = memberTrackingItemsQueryData[0]?.[1]?.find(
      (mti) => mti.trackingItemId === memberTrackingRecord.trackingItemId
    );
  }

  const unarchiveRecord = () => {
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
    );
  };

  if (memberTrackingItem?.trackingItem.status === TrackingItemStatus.INACTIVE) {
    return (
      <div tw="flex items-center space-x-1">
        <LockIcon color="disabled" fontSize="small" />
        <Typography
          variant="body2"
          sx={{ color: '#DADADA' }}
          onMouseEnter={(event) => {
            setOpen(true);
            setAnchorEl(event.currentTarget);
          }}
          onMouseLeave={() => {
            setOpen(false);
            setAnchorEl(null);
          }}
        >
          UNARCHIVE
        </Typography>
        <Popper
          id={`unarchive-popper-${memberTrackingRecord.id}`}
          open={open}
          anchorEl={anchorEl}
          placement={'left-start'}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper elevation={4} sx={{ bgcolor: 'white', p: 2, width: 250, textAlign: 'center' }}>
                {memberTrackingItem.trackingItem.organizationId === null ? (
                  <Typography tw="text-secondarytext">
                    This item is no longer a requirement and has been archived by a <strong>Monitor</strong> in the
                    <strong> Global Training Catalog.</strong>
                  </Typography>
                ) : (
                  <Typography tw="text-secondarytext">
                    This item is no longer a requirement and has been archived by a <strong>Training Monitor</strong>.
                  </Typography>
                )}
              </Paper>
            </Fade>
          )}
        </Popper>
      </div>
    );
  }

  return (
    <Button color="secondary" onClick={unarchiveRecord}>
      Unarchive
    </Button>
  );
};

const ArchiveActions: React.FC<{
  loggedInUserRole: string;
  memberTrackingRecord: MemberTrackingRecord & { trainee: User; authority: User };
}> = ({ loggedInUserRole, memberTrackingRecord }) => {
  const { mutate: updateMemberTrackingItem } = useUpdateMemberTrackingItem();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { variant } = useMemberItemTrackerContext();
  const { permissionCheck } = usePermissions();

  const canArchiveRecord = permissionCheck(loggedInUserRole, EFuncAction.UPDATE_ANY, EResource.MEMBER_TRACKING_ITEM);

  const archiveRecord = () => {
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
          queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItems(data.userId, EMtrVariant.ALL));
          queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItems(data.userId, EMtrVariant.IN_PROGRESS));
        },
      }
    );
  };

  if (!canArchiveRecord) {
    return null;
  }

  return (
    <>
      {variant === EMtrVariant.COMPLETED ? (
        <IconButton
          aria-label={`archive-tracking-record-${memberTrackingRecord.id}`}
          size="small"
          color="secondary"
          onClick={archiveRecord}
          tw="hover:bg-transparent"
        >
          <ArchiveIcon />
        </IconButton>
      ) : (
        <UnArchiveActions memberTrackingRecord={memberTrackingRecord} />
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
            color="secondary"
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
        <TableData tw="ml-auto color['#7B7B7B'] opacity-60 pr-10 w-60">
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
          <div tw="ml-auto flex">
            <ArchiveActions loggedInUserRole={LoggedInUser?.role?.name} memberTrackingRecord={memberTrackingRecord} />
            {isAdmin && (
              <IconButton
                color="secondary"
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
