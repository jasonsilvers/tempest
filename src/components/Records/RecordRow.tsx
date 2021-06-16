import { MemberTrackingRecord, TrackingItem, User } from '@prisma/client';
import dayjs from 'dayjs';
import React, { useLayoutEffect, useMemo } from 'react';
import tw from 'twin.macro';
import { DoneAllIcon } from '../../assets/Icons';
import { UserWithRole } from '../../repositories/userRepo';
import { useUser } from '@tron/nextjs-auth-p1';
import { CircularProgress } from '../../lib/ui';
import { useMemberTrackingRecord, useUpdateMemberTrackingRecord } from '../../hooks/api/memberTrackingRecord';
import { UseMutateFunction } from 'react-query';
import { getCategory } from '../../utils/Status';
import { ECategories } from '../../types/global';
import { OptionsObject, SnackbarKey, SnackbarMessage, useSnackbar } from 'notistack';
import { useMemberItemTrackerContext } from './MemberRecordTracker';
import setDomRole from '../../utils/SetDomRole';

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

const TableRow = tw.div`text-black border-b text-sm flex flex-wrap max-width[1440px] min-width[1080px] min-height[45px]`;
const TableData = tw.div`font-size[12px] mx-3`;

const Token = tw.div`rounded h-5 w-5 mr-2`;
const Overdue = tw(Token)`background-color[#AB0D0D]`;
const Done = tw(Token)`background-color[#49C68A]`;
const All = Token;
const Awaiting_Signature = tw(Token)`background-color[#4985c6]`;
const Upcoming = tw(Token)`background-color[#FAC50A]`;
const To_Do = tw(Token)`background-color[#8b5cf6]`;
const Archived = tw(Token)`bg-black`;

const ActionButton = tw.button`bg-primary border-radius[5px] min-width[120px] text-white min-height[25px] flex justify-center items-center `;
const NoActionButton = tw(ActionButton)`bg-transparent text-primary border-primary border`;
const DisabledButton = tw(NoActionButton)`border-black border-opacity-25 text-black text-opacity-25`;

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

const TokenObj: { [K in ECategories]: typeof Token } = {
  Overdue,
  Done,
  All,
  Awaiting_Signature,
  Upcoming,
  Archived,
  To_Do,
};
/**
 * Function to determine render for the Trainee Signature Block
 *
 * @param signatureDate   -- required to create the signature
 * @param signatureOwner  -- required to create the signature
 * @param loggedInUserId  -- required to render the signature button for the correct user
 * @returns
 */

const getTraineeSignature = (
  memberTrackingRecord: MemberTrackingRecord,
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
        <DisabledButton>{`Signed On ${dayjs(memberTrackingRecord.traineeSignedDate).format(
          'DD/MM/YY'
        )}`}</DisabledButton>
      </TableData>
    );
  }
};

const RecordRow: React.FC<{
  memberTrackingRecordId: number;
  trackingItem: TrackingItem;
}> = ({ memberTrackingRecordId, trackingItem }) => {
  const { user: LoggedInUser } = useUser<UserWithRole>();
  const { mutate, isLoading } = useUpdateMemberTrackingRecord('sign_trainee');
  const { activeCategory, increaseCategoryCount, categories } = useMemberItemTrackerContext();
  const { enqueueSnackbar } = useSnackbar();

  const trackingRecordQuery = useMemberTrackingRecord(memberTrackingRecordId);

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

  if (trackingRecordQuery.isLoading) {
    return <RecordRowSkeleton />;
  }

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
      <div tw="flex w-80 justify-between">
        <TableData tw="w-40">
          <>
            <span tw={'opacity-40'}>Completed: </span>
            {dayjs(trackingRecordQuery.data?.completedDate).format('DD MMM YY')}
          </>
        </TableData>
        <TableData tw="w-40">
          <>
            <span tw={'opacity-40'}>Due: </span>
            {dayjs(trackingRecordQuery.data?.completedDate).add(trackingItem?.interval, 'days').format('DD MMM YY')}
          </>
        </TableData>
      </div>
      <div tw="flex ml-auto">
        {isLoading ? (
          <CircularProgress tw="ml-2" size={18} />
        ) : // If not loading then check what buttons to render
        trackingRecordQuery.data.authoritySignedDate && trackingRecordQuery.data.traineeSignedDate ? (
          <TableData tw="mr-20 color['#7B7B7B'] opacity-60">
            Signatures Present <DoneAllIcon tw="ml-3 color['#DADADA']" />
          </TableData>
        ) : (
          // If both signatures are not signed then render buttons
          <>
            <TableData tw="mr-3">
              <DisabledButton>Awaiting Signature</DisabledButton>
            </TableData>
            {getTraineeSignature(
              trackingRecordQuery.data,
              trackingRecordQuery.data?.traineeSignedDate,
              LoggedInUser,
              mutate,
              enqueueSnackbar
            )}
          </>
        )}
      </div>
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
