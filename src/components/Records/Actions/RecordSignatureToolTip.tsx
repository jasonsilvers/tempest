import { User } from '@prisma/client';
const dayjs = require('dayjs');
import tw from 'twin.macro';
import React, { ReactElement } from 'react';
import { TempestToolTip } from '../../../lib/ui';
import { Zoom } from '@mui/material';

const Container = tw.div`text-right `;
const Name = tw.div``;
const Date = tw.div``;

const getTitle = (traineeSignature: Signature, authoritySignature: Signature) => {
  const { firstName: tranieeFN, lastName: traineeLN, rank: traineeRank } = traineeSignature?.signee || {};

  const {
    firstName: authorityFN = null,
    lastName: authorityLN = null,
    rank: authorityRank = null,
  } = authoritySignature ? authoritySignature?.signee || {} : {};

  const authorityRankDisplay = authorityRank ? authorityRank?.split('/')[0] : '';
  const traineeRankDisplay = traineeRank ? traineeRank?.split('/')[0] : '';

  return (
    <div tw="flex space-x-3">
      {authoritySignature ? (
        <Container>
          <Name>{`${authorityRankDisplay} ${authorityFN} ${authorityLN}`}</Name>
          <Date>{dayjs(authoritySignature.date).format('hhmm MM/DD/YY')}</Date>
        </Container>
      ) : null}
      <Container>
        <Name>{`${traineeRankDisplay} ${tranieeFN} ${traineeLN}`}</Name>
        <Date>{dayjs(traineeSignature.date).format('hhmm MM/DD/YY')}</Date>
      </Container>
    </div>
  );
};

export type Signature = { signee: User; date: Date };
interface IToolTipProps {
  children: ReactElement;
  traineeSignature: Signature;
  authoritySignature?: Signature;
}

const RecordSignatureToolTip: React.FC<IToolTipProps> = ({ traineeSignature, authoritySignature = null, children }) => {
  if (!traineeSignature) {
    return children;
  }
  return (
    <TempestToolTip
      arrow
      placement={'top-start'}
      TransitionComponent={Zoom}
      TransitionProps={{ timeout: 300 }}
      title={getTitle(traineeSignature, authoritySignature)}
    >
      {children}
    </TempestToolTip>
  );
};

export { RecordSignatureToolTip };
