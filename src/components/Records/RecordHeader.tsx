import { User } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import React from 'react';
import tw from 'twin.macro';

const Header = tw.h1`text-2xl text-black mb-3`;
const Name = tw.h4`text-xl text-black mb-2`;
const Table = tw.div`text-left mb-14 `;
const Row = tw.div``;
const Base = tw.div`text-xl mb-1 text-hg pr-5 capitalize`;
const Rank = tw(Base)``;
const Address = tw(Base)``;
const AFSC = tw(Base)``;
const DutyTitle = tw(Base)``;

const HeaderUser = () => {
  const { user } = useUser<User>();

  return user ? (
    <>
      <Header>EMPLOYEE SAFETY AND HEALTH RECORD</Header>
      <Name>{`${user.lastName} ${user.firstName}`}</Name>
      <Table>
        <Row>
          <Rank>{user.rank}</Rank>
          <Address>{user.address}</Address>
        </Row>
        <Row>
          <AFSC>{user.afsc}</AFSC>
          <DutyTitle>{user.dutyTitle}</DutyTitle>
        </Row>
      </Table>
    </>
  ) : (
    <></>
  );
};

export default HeaderUser;
