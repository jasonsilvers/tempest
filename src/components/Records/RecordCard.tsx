import { MemberTrackingRecord, TrackingItem, User } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import axios from 'axios';
import dayjs from 'dayjs';
import React from 'react';
import { useQuery } from 'react-query';
import tw from 'twin.macro';

export type RecordWithTrackingItemStatus =
  | 'All'
  | 'Done'
  | 'Upcoming'
  | 'Overdue'
  | 'SignatureRequired';

export type RecordWithTrackingItem = MemberTrackingRecord & {
  trackingItem: TrackingItem;
  status: RecordWithTrackingItemStatus;
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
const Card = tw.div`text-black p-2 h-32 w-5/12 min-width[360px] max-width[400px] flex[1 1 10rem] mt-4 box-shadow[0px 2px 4px rgba(0, 0, 0, 0.15), inset 0px 0px 0px 1px #D3D3D3] border-radius[5px] text-sm flex justify-between relative`;
const Left = tw.div`flex flex-col h-full justify-between mx-2 flex-basis[60%]`;
const Right = tw.div`flex flex-col items-end width[fit-content]`;
const ItemContainer = tw.div`font-size[12px] height[min-content] flex`;
const SignatureContainer = tw.div`absolute bottom-0 right-0 origin-bottom-right`;
// conditional styled twin elements for get Signature functions
const AwaitSignature = tw.div`font-bold`;
const SignatureButton = tw.button`p-0.5 ml-1 w-24 background-color[#A8ADB4] text-white text-center`;

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

  if (!signatureDate && signatureOwner.id !== loggedInUserId) {
    return 'Awaiting Trainee Signature';
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
    return `Signed by ${signatureOwner.firstName} ${signatureOwner.lastName}`;
  }
};
/**
 * Function to determine render for the Authority Signature Block
 *
 * @param authSigDate      -- required to create signature
 * @param traineeSigDate   -- required to determine button rendering
 * @param canSignAuth      -- permission boolean for update:any Record
 * @returns
 */
const getAuthSignature = (
  authSigDate: Date,
  signatureOwner: User,
  canSignAuth: boolean
) => {
  // if no auth signature date
  // and member does not have permissions to sign
  // then render "Awaiting Signature*"
  if (!authSigDate && !canSignAuth) {
    return <AwaitSignature>Awaiting Signature*</AwaitSignature>;
  }

  // if no auth signature date
  // and user has permissions to sign
  // render sign button
  if (!authSigDate && canSignAuth) {
    return <SignatureButton>Sign & Submit</SignatureButton>;
  }

  // If no cases return above then all signatures are signed
  // render the signature based on date and signature owner
  if (signatureOwner) {
    return `Signed by ${signatureOwner.firstName} ${signatureOwner.lastName}`;
  }
};

const RecordCard: React.FC<{
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
    <Card>
      <Left>
        <ItemContainer tw={'font-size[16px]'}>
          <DynamicToken />
          {trackingRecord.trackingItem.title}
        </ItemContainer>
        <ItemContainer tw={'text-purple-500'}>
          {/* get the common text for number of days if exits else render '## days' */}
          {daysToString[trackingRecord.trackingItem.interval] ??
            `${trackingRecord.trackingItem.interval} days`}
        </ItemContainer>
      </Left>

      <Right>
        <ItemContainer>
          <>
            <span tw={'opacity-40'}>Completed: </span>
            {dayjs(trackingRecord.completedDate).format('DD MMM YY')}
          </>
        </ItemContainer>
        <ItemContainer>
          <>
            <span tw={'opacity-40'}>Due: </span>
            {dayjs(trackingRecord.completedDate)
              .add(trackingRecord.trackingItem.interval, 'days')
              .format('DD MMM YY')}
          </>
        </ItemContainer>
        <SignatureContainer>
          {/* <div tw="mx-2">
            {getAuthSignature(
              trackingRecord.authoritySignedDate,
              users ? users[trackingRecord.authorityId] : undefined,
              canSignAuth
            )}
          </div>
          <div>
            {getTraineeSignature(
              trackingRecord.traineeSignedDate,
              // pass undefined if data is still fetching
              users ? users[trackingRecord.traineeId] : undefined,
              user.id
            )}
          </div> */}
          <SignatureButton>Supervisor Signature</SignatureButton>
          <SignatureButton>Trainner Signature</SignatureButton>
        </SignatureContainer>
      </Right>
    </Card>
  );
};

export default RecordCard;
