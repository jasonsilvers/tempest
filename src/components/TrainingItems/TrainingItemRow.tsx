import { TrackingItem } from '@prisma/client';
import React from 'react';
import tw from 'twin.macro';
import { IconButton } from '../../lib/ui';
import { getInterval } from '../../utils/DaysToString';
import { DeleteIcon } from '../../assets/Icons';
import { useDeleteTrackingItem } from '../../hooks/api/trackingItem';

const Container = tw.div`flex h-10 items-center border-b-2`;
const RowTitle = tw.div`font-size[12px] mx-3 w-60`;
const RowInterval = tw.div`font-size[12px] mx-3 w-20`;
const DescriptionTable = tw.table`w-7/12 ml-10`;
const DescriptionContainer = tw.div`table-cell align-middle h-10`;
const RowDescription = tw.div`font-size[12px] min-height[20px] max-height[40px] line-clamp[2] overflow-ellipsis overflow-hidden -webkit-box-orient[vertical] display[-webkit-box]`;
const StyledDeleteIcon = tw(DeleteIcon)`text-xl`;

export const TrainingItemHeader = () => (
  <Container tw="font-bold">
    <RowTitle>Title</RowTitle>
    <RowInterval>Interval</RowInterval>
    <DescriptionTable>
      <DescriptionContainer>
        <RowDescription>Description</RowDescription>
      </DescriptionContainer>
    </DescriptionTable>
  </Container>
);

export const TrainingItemRow: React.FC<{ trackingItem: TrackingItem; canDelete: boolean }> = ({
  trackingItem,
  canDelete,
}) => {
  const { mutate: del } = useDeleteTrackingItem();

  return (
    <Container className="group" tw="hover:bg-gray-100">
      <RowTitle>{trackingItem.title}</RowTitle>
      <RowInterval>{getInterval(trackingItem.interval)}</RowInterval>
      <DescriptionTable tw="w-7/12">
        <DescriptionContainer>
          <RowDescription>{trackingItem.description}</RowDescription>
        </DescriptionContainer>
      </DescriptionTable>
      {canDelete ? (
        // this could be it's own component
        // gitHub copilot would like you you to know that
        // its not worth it's own component
        // thanks coPilot!
        <IconButton size="small" onClick={() => del(trackingItem.id)} tw="ml-auto mr-3 hover:bg-transparent">
          <StyledDeleteIcon tw="opacity-0 group-hocus:opacity-100" />
        </IconButton>
      ) : (
        <IconButton size="small" />
      )}
    </Container>
  );
};
