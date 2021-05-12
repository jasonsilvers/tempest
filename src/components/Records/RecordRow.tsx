import { MemberTrackingRecord, TrackingItem, User } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import axios from 'axios';
import dayjs from 'dayjs';
import React from 'react';
import { useQuery } from 'react-query';
import tw from 'twin.macro';
import SignatureButton from '../../assets/SignatureButton.svg';
import DoubleCheckMark from '../../assets/DoubleCheckMark.svg';

export type RecordWithTrackingItemStatus =
  | 'All'
  | 'Done'
  | 'Upcoming'
  | 'Overdue'
  | 'SignatureRequired';

export type RecordWithTrackingItem = MemberTrackingRecord & {
  trackingItem: TrackingItem;
  status?: RecordWithTrackingItemStatus;
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

// conditional styled twin elements for get Signature functions
const AwaitSignature = tw.div`font-bold`;
// const SignatureButton = tw.button`p-1.5 w-56 background-color[#A8ADB4] text-white text-center`;

const Token = tw.div`rounded h-5 w-5 mr-2`;
const Overdue = tw(Token)`background-color[#AB0D0D]`;
const Done = tw(Token)`background-color[#49C68A]`;
const All = Token;
const SignatureRequired = tw(Token)`background-color[#4985c6]`;
const Upcoming = tw(Token)`background-color[#FAC50A]`;
const TokenObj: { [K in RecordWithTrackingItemStatus]: any } = {
  Overdue,
  Done,
  All,
  SignatureRequired,
  Upcoming,
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
}> = ({ trackingRecord, canSignAuth }) => {
  //###############################################################################\\
  //\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\\\
  //⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺ \\
  // Use Query here is just for development purposes.                              \\
  // Future versions of app will include the the user object per training record   \\
  // Data will be fetched via api call to fetch records by trainee or authority id \\
  // Had to set enabled: false here due to some weird recursive api call repeat    \\
  //______________________________________________________________________________ \\
  //\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\\\
  // Beautiful ASCII Art by @SnekCode                                              \\
  //###############################################################################\\

  const { data: queryUsers } = useQuery<User[]>(
    'users',
    async () => await axios.get('/api/user').then((result) => result.data),
    { enabled: false }
  );

  // user id is needed in order to check if button can be signed.
  const { user } = useUser<User>();

  // Mapping the Users Array into an accessible hash map by user id
  // Future versions of app will have the complete user object on the Tracking Record
  let users = {};
  if (queryUsers) {
    users = queryUsers.reduce(
      (acc, currentVal) => ({ ...acc, [currentVal.id]: currentVal }),
      users
    );
  }
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
          users ? users[trackingRecord.traineeId] : undefined,
          user.id
        )}
      </TableData>
    </TableRow>
  );
};

export default RecordRow;
