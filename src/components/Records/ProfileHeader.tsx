import { User } from '@prisma/client';
import React from 'react';
import tw from 'twin.macro';
import { EditIcon } from '../../assets/Icons';
import { IconButton } from '../../lib/ui';

const Header = tw.h1`text-xl text-black mb-3 font-bold`;
const Name = tw.h4`text-lg text-black`;
const Table = tw.div`text-left mb-6`;
const Column = tw.div`flex flex-col`;
const Row = tw.div`flex flex-row`;
const Base = tw.div`text-sm mb-1 text-hg pr-5 capitalize`;
const Rank = tw(Base)`w-16`;
const Address = tw(Base)``;
const AFSC = tw(Base)`w-16`;
const DutyTitle = tw(Base)``;

const HeaderUser: React.FC<{ user: User }> = ({ user }) => {
  return user ? (
    <>
      <Header>EMPLOYEE SAFETY AND HEALTH RECORD</Header>
      <div tw="flex items-center">
        <Name>{`${user.lastName} ${user.firstName}`}</Name>
        <IconButton aria-label={`edit-user`} size="small" tw="ml-2 mr-3 hover:bg-transparent">
          <EditIcon />
        </IconButton>
      </div>
      <Table>
        <Column>
          <Row>
            <Rank>{user.rank}</Rank>
            <Address>{user.address}</Address>
          </Row>
        </Column>
        <Column>
          <Row>
            <AFSC>{user.afsc}</AFSC>
            <DutyTitle>{user.dutyTitle}</DutyTitle>
          </Row>
        </Column>
      </Table>
    </>
  ) : (
    <></>
  );
};

export default HeaderUser;
