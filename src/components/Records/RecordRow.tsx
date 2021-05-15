import { MemberTrackingRecord, TrackingItem, User } from '@prisma/client';
import dayjs from 'dayjs';
import React from 'react';
import tw from 'twin.macro';
import { SignatureButton, DoubleCheckMark } from '../../assets';
import { ECategories } from './MemberRecordTracker';
import { UserWithRole } from '../../repositories/userRepo';
import { useUser } from '@tron/nextjs-auth-p1';

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

// box-sizing: border-box;
// box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
// border-radius: 5px;
// styled twin elements
// Double box shadow here to avoid border radius issues i was experiencing
const TableRow = tw.div`text-black box-shadow[0px 2px 4px rgba(0, 0, 0, 0.15), inset 0px 0px 0px 1px #D3D3D3] border-radius[5px] text-sm flex items-center flex-wrap min-width[350px]`;
const TableData = tw.div`py-3 font-size[12px] flex[0 0 auto] mx-3`;

// const SignatureButton = tw.button`p-1.5 w-56 background-color[#A8ADB4] text-white text-center`;

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
  signatureDate: Date,
  signatureOwner: User,
  loggedInUserId: string
) => {
  // fail back if the signatureOwner:User is false
  // would indicate data is still fetching
  if (!signatureOwner) {
    return 'Fetching Data...';
  }

  // if signature date is false and
  // user logged in is the signature owner
  // render button to sign
  if (!signatureDate && signatureOwner.id === loggedInUserId) {
    return <SignatureButton tw="" />;
  }
  // if signature date is true and signature owner is true
  // render signature based on the signature owner and date
  if (signatureOwner) {
    return <DoubleCheckMark />;
  }
};

const RecordRow: React.FC<{
  trackingRecord: RecordWithTrackingItem;
  canSignAuth: boolean;
}> = ({ trackingRecord }) => {
  const { user } = useUser<UserWithRole>();

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
        <TableData tw="">
          <>
            <span tw={'opacity-40'}>Completed: </span>
            {dayjs(trackingRecord.completedDate).format('DD MMM YY')}
          </>
        </TableData>
        <TableData tw="">
          <>
            <span tw={'opacity-40'}>Due: </span>
            {dayjs(trackingRecord.completedDate)
              .add(trackingRecord.trackingItem.interval, 'days')
              .format('DD MMM YY')}
          </>
        </TableData>
      </div>
      <TableData tw="ml-auto mr-3 w-10">
        {getTraineeSignature(
          trackingRecord.traineeSignedDate,
          // pass undefined if data is still fetching
          user,
          user?.id ?? undefined
        )}
      </TableData>
    </TableRow>
  );
};

export default RecordRow;
