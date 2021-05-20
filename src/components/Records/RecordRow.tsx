import { MemberTrackingRecord, TrackingItem, User } from '@prisma/client';
import dayjs from 'dayjs';
import React from 'react';
import tw from 'twin.macro';
// import { DoubleCheckMark } from '../../assets';
import { SignatureButtonIcon, DoneAllIcon } from '../../assets/Icons';
import { ECategories } from './MemberRecordTracker';
import { UserWithRole } from '../../repositories/userRepo';
import { useUser } from '@tron/nextjs-auth-p1';
import { CircularProgress, IconButton } from '../../lib/ui';
import { useUpdateMemberTrackingRecord } from '../../hooks/api/memberTrackingRecord';
import { UseMutateFunction } from 'react-query';

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

const TableRow = tw.div`text-black box-shadow[0px 2px 4px rgba(0, 0, 0, 0.15), inset 0px 0px 0px 1px #D3D3D3] border-radius[5px] text-sm flex items-center flex-wrap min-width[350px] min-height[55px]`;
const TableData = tw.div`py-3 font-size[12px] flex[0 0 auto] mx-3`;

const SignatureButtonIconStyled = tw(SignatureButtonIcon)`text-gray-600`;
const Token = tw.div`rounded h-5 w-5 mr-2`;
const Overdue = tw(Token)`background-color[#AB0D0D]`;
const Done = tw(Token)`background-color[#49C68A]`;
const All = Token;
const SignatureRequired = tw(Token)`background-color[#4985c6]`;
const Upcoming = tw(Token)`background-color[#FAC50A]`;
const Archived = tw(Token)`bg-black`;
const TokenObj: { [K in ECategories]: typeof Token } = {
  Overdue,
  Done,
  All,
  SignatureRequired,
  Upcoming,
  Archived,
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
  >
) => {
  // fail back if the signatureOwner:User is false
  // would indicate data is still fetching
  if (!loggedInUser) {
    return 'Fetching Data...';
  }

  const handleSignTrainee = () => {
    signRecordFor({ memberTrackingRecord, userId: loggedInUser.id });
  };

  // if signature date is false and
  // user logged in is the signature owner
  // render button to sign
  if (!signatureDate && memberTrackingRecord.traineeId === loggedInUser.id) {
    return (
      <IconButton size="small" onClick={handleSignTrainee}>
        <SignatureButtonIconStyled size="32" />
      </IconButton>
    );
  }
  // if signature date is true and signature owner is true
  // render signature based on the signature owner and date
  if (loggedInUser) {
    return <DoneAllIcon />;
  }
};

const RecordRow: React.FC<{
  trackingRecord: RecordWithTrackingItem;
}> = ({ trackingRecord }) => {
  const { user: LoggedInUser } = useUser<UserWithRole>();
  const { mutate, isLoading } = useUpdateMemberTrackingRecord('sign_trainee');

  const DynamicToken = TokenObj[trackingRecord.status];
  return (
    <TableRow>
      <TableData tw={'font-size[16px] overflow-ellipsis w-56'}>
        <div tw={'flex'}>
          <DynamicToken />
          {trackingRecord.trackingItem.title}
        </div>
      </TableData>
      <TableData tw={'text-purple-500 w-20 ml-auto text-right'}>
        {/* get the common text for number of days if exits else render '## days' */}
        {daysToString[trackingRecord.trackingItem.interval] ??
          `${trackingRecord.trackingItem.interval} days`}
      </TableData>
      <div tw="flex w-72 justify-between">
        <TableData tw="w-36">
          <>
            <span tw={'opacity-40'}>Completed: </span>
            {dayjs(trackingRecord.completedDate).format('DD MMM YY')}
          </>
        </TableData>
        <TableData tw="w-36">
          <>
            <span tw={'opacity-40'}>Due: </span>
            {dayjs(trackingRecord.completedDate)
              .add(trackingRecord.trackingItem.interval, 'days')
              .format('DD MMM YY')}
          </>
        </TableData>
      </div>
      <TableData tw="ml-auto mr-3 w-10">
        {isLoading ? (
          <CircularProgress tw="ml-2" size={18} />
        ) : !trackingRecord.traineeSignedDate ? (
          getTraineeSignature(
            trackingRecord,
            trackingRecord.traineeSignedDate,
            LoggedInUser,
            mutate
          )
        ) : !trackingRecord.authoritySignedDate ? (
          <DoneAllIcon />
        ) : null}
      </TableData>
    </TableRow>
  );
};

export default RecordRow;
