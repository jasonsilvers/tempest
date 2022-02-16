import { TrackingItem } from '@prisma/client';
import React from 'react';
import tw from 'twin.macro';
import { TempestDeleteIcon } from '../../lib/ui';
import { TrackingItemInterval } from '../../utils/daysToString';
import { useDeleteTrackingItem } from '../../hooks/api/trackingItem';
import { IconButton } from '@mui/material';

const Container = tw.div`flex h-10 items-center border-b`;
const RowTitle = tw.div`mx-3 w-72`;
const RowInterval = tw.div`mx-3 w-28`;
const DescriptionTable = tw.div`w-7/12 ml-10`;
const DescriptionContainer = tw.div`table-cell align-middle h-10`;
const RowDescription = tw.div`min-height[20px] max-height[40px] line-clamp[2] overflow-ellipsis overflow-hidden -webkit-box-orient[vertical] display[-webkit-box]`;

export const TrainingItemHeader = () => (
  <Container>
    <RowTitle tw="text-lg">Training Title</RowTitle>
    <RowInterval tw="text-lg">Recurrence</RowInterval>
    <DescriptionTable>
      <DescriptionContainer>
        <RowDescription tw="text-lg">Description</RowDescription>
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
      <RowInterval>{TrackingItemInterval[trackingItem.interval]}</RowInterval>
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
        <IconButton
          aria-label={`delete ${trackingItem.title}`}
          size="small"
          onClick={() => del(trackingItem.id)}
          tw="ml-auto mr-3 hover:bg-transparent"
        >
          <TempestDeleteIcon />
        </IconButton>
      ) : (
        <IconButton size="small" />
      )}
    </Container>
  );
};
