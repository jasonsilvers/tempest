import { MemberTrackingRecord, TrackingItem, User } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import axios from 'axios';
import dayjs from 'dayjs';
import React from 'react';
import { useQuery } from 'react-query';
import tw from 'twin.macro';

export type RecordWithTrackingItem = MemberTrackingRecord & {
  trackingItem: TrackingItem;
};

// object to get common text for amount of days
const daysToString = {
  7: 'Weekly',
  14: 'Bi-Weekly',
  30: 'Monthly',
  31: 'Monthly',
  90: 'Quarterly',
  180: 'Semi-Annually',
  365: 'Annually',
};

// conditional styled twin elements for get Signature functions
const AwaitSignature = tw.div`font-bold`;
const SignatureButton = tw.button`p-1.5 w-56 background-color[#A8ADB4] text-white text-center`;

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
    return <SignatureButton>Sign & Submit to Trainer</SignatureButton>;
  }
  // if signature date is true and signature owner is true
  // render signature based on the signature owner and date
  if (signatureOwner) {
    return `Signed by ${signatureOwner.firstName} ${
      signatureOwner.lastName
    } ${dayjs(signatureDate).format('MM/DD/YY hh:mm')}`;
  }
};
/**
 * Function to determine render for the Authority Signature Block
 *
 * @param authSigDate      -- required to create signature
 * @param traineeSigDate   -- required to determine button rendering
 * @param signatureOwner   -- required to create signature
 * @param loggedInUserId   -- required to render the signature button for the correct user
 * @returns
 */
const getAuthSignature = (
  authSigDate: Date,
  traineeSigDate: Date,
  signatureOwner: User,
  loggedInUserId: string
) => {
  // fail back if the signatureOwner:User is false
  // would indicate data is still fetching
  if (!signatureOwner) {
    return 'Fetching Data...';
  }
  // if tracking record's trainee date is not set or
  // the user logged in is not the signature owner or
  // the auth signature date is false
  // then render "Awaiting Signature*"
  if (
    !traineeSigDate ||
    (signatureOwner.id !== loggedInUserId && !authSigDate)
  ) {
    return <AwaitSignature>Awaiting Signature*</AwaitSignature>;
  }
  // if trainee signature is good and
  // the logged in user is the signature owner
  // render sign button
  if (traineeSigDate && signatureOwner.id === loggedInUserId) {
    return <SignatureButton>Sign & Submit</SignatureButton>;
  }

  // If no cases return above then all signatures are signed
  // render the signature based on date and signature owner
  if (signatureOwner) {
    return `Signed by ${signatureOwner.firstName} ${
      signatureOwner.lastName
    } ${dayjs(authSigDate).format('MM/DD/YY hh:mm')}`;
  }
};

// styled twin elements
const TableRow = tw.tr`text-black border-bottom[1px solid] border-color[hsla(0, 0%, 0%, 0.15)] text-sm`;
const TableData = tw.td`py-3`;

const RecordRow: React.FC<{
  trackingRecord: RecordWithTrackingItem;
}> = ({ trackingRecord }) => {
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

  return (
    <TableRow>
      <TableData>{trackingRecord.trackingItem.title}</TableData>
      <TableData>
        {/* get the common text for number of days if exits else render '## days' */}
        {daysToString[trackingRecord.trackingItem.interval] ??
          `${trackingRecord.trackingItem.interval} days`}
      </TableData>
      <TableData>
        {dayjs(trackingRecord.completedDate).format('DD MMM YY')}
      </TableData>
      <TableData>
        {getAuthSignature(
          trackingRecord.authoritySignedDate,
          trackingRecord.traineeSignedDate,
          // pass undefined if data is still fetching
          users ? users[trackingRecord.authorityId] : undefined,
          user.id
        )}
      </TableData>
      <TableData>
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
