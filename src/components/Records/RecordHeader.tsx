import { User } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import React from 'react';
import tw from 'twin.macro';

const Header = tw.h1`text-xl text-black mb-3 font-bold`;
const Name = tw.h4`text-lg text-black mb-2`;
const Table = tw.div`text-left mb-6`;
const Column = tw.div`flex flex-col`;
const Row = tw.div`flex flex-row`;
const Base = tw.div`text-sm mb-1 text-hg pr-5 capitalize`;
const Rank = tw(Base)`w-16`;
const Address = tw(Base)``;
const AFSC = tw(Base)`w-16`;
const DutyTitle = tw(Base)``;

const HeaderUser = () => {
  const { user } = useUser<User>();

  return user ? (
    <>
      <Header>EMPLOYEE SAFETY AND HEALTH RECORD</Header>
      <Name>{`${user.lastName} ${user.firstName}`}</Name>
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
