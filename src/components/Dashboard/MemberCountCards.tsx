import React, { useState } from 'react';
import { CancelIcon, CheckCircleIcon, HighlightOffIcon, WarningIcon } from '../../assets/Icons';
import { Card, LoadingSpinner } from '../../lib/ui';
import { Actions, StatusCounts } from './Types';
import tw from 'twin.macro';
import { EStatus } from './Enums';

const CardVariantColors = {
  Done: {
    text: tw`text-[#6FD9A6] `,
    activeText: tw`text-white`,
    background: tw`bg-white`,
    activeBackground: tw`bg-[#6FD9A6] `,
    border: tw`border-2 border-[#6FD9A6] `,
  },
  Overdue: {
    text: tw`text-[#FB7F7F]`,
    activeText: tw`text-white`,
    background: tw`bg-white`,
    activeBackground: tw`bg-[#FB7F7F]`,
    border: tw`border-2 border-[#FB7F7F]`,
  },
  Upcoming: {
    text: tw`text-[#F6B83F]`,
    activeText: tw`text-white`,
    background: tw`bg-white`,
    activeBackground: tw`bg-[#F6B83F]`,
    border: tw`border-2 border-[#F6B83F]`,
  },
  All: {
    text: tw`text-secondary`,
    activeText: tw`text-white`,
    background: tw`bg-white`,
    activeBackground: tw`bg-secondary`,
    border: tw`border-2 border-secondary`,
  },
};

const baseCSS = tw`h-24 flex-grow w-24 cursor-pointer`;

const CountCard = ({
  variant,
  isActive,
  onClick,
  children,
}: {
  variant: EStatus;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <Card
      css={
        isActive
          ? [CardVariantColors[variant].activeText, CardVariantColors[variant].activeBackground, baseCSS]
          : [
              CardVariantColors[variant].border,
              CardVariantColors[variant].text,
              CardVariantColors[variant].background,
              baseCSS,
            ]
      }
      onClick={onClick}
    >
      {children}
    </Card>
  );
};

type MemberCountCardsProps = {
  isLoading: boolean;
  counts: StatusCounts;
  variant: EStatus;
  dispatch: React.Dispatch<Actions>;
};

export const MemberCountCards = ({ isLoading, counts, variant, dispatch }: MemberCountCardsProps) => {
  return (
    <>
      <CountCard
        variant={EStatus.ALL}
        isActive={variant === EStatus.ALL}
        onClick={() => dispatch({ type: 'filterByStatus', statusFilter: EStatus.ALL })}
      >
        <div tw="flex fixed right-2">{isLoading ? <LoadingSpinner size={'10px'} /> : null}</div>
        <h1 tw="text-2xl pl-1 underline">All</h1>
        <div tw="flex items-end">
          <HighlightOffIcon fontSize="large" />
          <h2 tw="ml-auto text-5xl">{counts.All}</h2>
        </div>
      </CountCard>
      <CountCard
        variant={EStatus.OVERDUE}
        isActive={variant === EStatus.OVERDUE}
        onClick={() => dispatch({ type: 'filterByStatus', statusFilter: EStatus.OVERDUE })}
      >
        <div tw="flex fixed right-2">{isLoading ? <LoadingSpinner size={'10px'} /> : null}</div>
        <h1 tw="text-2xl pl-1">Overdue</h1>

        <div tw="flex items-end">
          <CancelIcon fontSize="large" />
          <h2 tw="ml-auto text-5xl">{counts.Overdue}</h2>
        </div>
      </CountCard>
      <CountCard
        variant={EStatus.UPCOMING}
        isActive={variant === EStatus.UPCOMING}
        onClick={() => dispatch({ type: 'filterByStatus', statusFilter: EStatus.UPCOMING })}
      >
        <div tw="flex fixed right-2">{isLoading ? <LoadingSpinner size={'10px'} /> : null}</div>
        <h1 tw="text-2xl pl-1">Upcoming</h1>

        <div tw="flex items-end">
          <WarningIcon fontSize="large" />
          <h2 tw="ml-auto text-5xl">{counts.Upcoming}</h2>
        </div>
      </CountCard>
      <CountCard
        variant={EStatus.DONE}
        isActive={variant === EStatus.DONE}
        onClick={() => dispatch({ type: 'filterByStatus', statusFilter: EStatus.DONE })}
      >
        <div tw="flex fixed right-2">{isLoading ? <LoadingSpinner size={'10px'} /> : null}</div>
        <h1 tw="text-2xl pl-1">Done</h1>

        <div tw="flex items-end">
          <CheckCircleIcon fontSize="large" />
          <h2 tw="ml-auto text-5xl">{counts.Done}</h2>
        </div>
      </CountCard>
    </>
  );
};
