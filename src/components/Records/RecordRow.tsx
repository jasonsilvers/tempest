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

const daysToString = {
  7: 'Weekly',
  14: 'Bi-Weekly',
  30: 'Monthly',
  31: 'Monthly',
  90: 'Quarterly',
  180: 'Semi-Annually',
  365: 'Annually',
};

const AwaitSignature = tw.div`font-bold`;
const SignatureButton = tw.button`p-1.5 w-56 background-color[#A8ADB4] text-white text-center`;

const getTraineeSignature = (
  signatureDate: Date,
  signatureOwner: User,
  loggedInUserId: string
) => {
  if (!signatureOwner) {
    return 'Fetching Data...';
  }
  if (!signatureDate && signatureOwner.id === loggedInUserId) {
    return <SignatureButton>Sign & Submit to Trainer</SignatureButton>;
  }

  if (signatureOwner) {
    return `Signed by ${signatureOwner.firstName} ${
      signatureOwner.lastName
    } ${dayjs(signatureDate).format('MM/DD/YY hh:mm')}`;
  }
};

const getAuthSignature = (
  authSigDate: Date,
  traineeSigDate: Date,
  signatureOwner: User,
  loggedInUserId: string
) => {
  if (!signatureOwner) {
    return 'Fetching Data...';
  }
  if (
    !traineeSigDate ||
    (signatureOwner.id !== loggedInUserId && !authSigDate)
  ) {
    return <AwaitSignature>Awaiting Signature*</AwaitSignature>;
  }
  if (traineeSigDate && signatureOwner.id === loggedInUserId) {
    return <SignatureButton>Sign & Submit</SignatureButton>;
  }

  if (signatureOwner) {
    return `Signed by ${signatureOwner.firstName} ${
      signatureOwner.lastName
    } ${dayjs(authSigDate).format('MM/DD/YY hh:mm')}`;
  }
};

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
  //______________________________________________________________________________ \\
  //\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\\\
  // Beautiful ASCII Art by @SnekCode                                              \\
  //###############################################################################\\

  const { data: queryUsers } = useQuery<User[]>(
    'users',
    async () => await axios.get('/api/user').then((result) => result.data),
    { enabled: false }
  );

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
          users ? users[trackingRecord.authorityId] : undefined,
          user.id
        )}
      </TableData>
      <TableData>
        {getTraineeSignature(
          trackingRecord.traineeSignedDate,
          users ? users[trackingRecord.traineeId] : undefined,
          user.id
        )}
      </TableData>
    </TableRow>
  );
};

export default RecordRow;
