import { TrackingItem } from '@prisma/client';
import tw from 'twin.macro';
import { getInterval } from '../../utils/DaysToString';

const Container = tw.div`flex h-10 items-center border-2`;
const RowTitle = tw.div`font-size[12px] mx-3 w-60`;
const RowInterval = tw.div`font-size[12px] mx-3 w-20`;
const DescriptionTable = tw.table`w-7/12 ml-10`;
const DescriptionContainer = tw.div`table-cell align-middle h-10`;
const RowDescription = tw.div`font-size[12px] min-height[20px] max-height[40px] line-clamp[2] overflow-ellipsis overflow-hidden -webkit-box-orient[vertical] display[-webkit-box]`;

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

export const TrainingItemRow: React.FC<{ trackingItem: TrackingItem }> = ({ trackingItem }) => {
  return (
    <Container>
      <RowTitle>{trackingItem.title}</RowTitle>
      <RowInterval>{getInterval(trackingItem.interval)}</RowInterval>
      <DescriptionTable tw="w-7/12">
        <DescriptionContainer>
          <RowDescription>{trackingItem.description}</RowDescription>
        </DescriptionContainer>
      </DescriptionTable>
    </Container>
  );
};
