import { Typography } from '@mui/material';
import tw from 'twin.macro';
import { EStatus } from '../components/Dashboard/Enums';

export const StatusDetailVariant = {
  Done: {
    textColor: tw`text-[#6FD9A6]`,
  },
  Overdue: {
    textColor: tw`text-[#FB7F7F]`,
  },
  Upcoming: {
    textColor: tw`text-[#F6B83F]`,
  },
  Archived: {
    textColor: tw`text-gray-500`,
  },
};

const StatusPillVariant = {
  Done: {
    color: tw`bg-[#6FD9A6]`,
    textColor: tw`text-white`,
  },
  Overdue: {
    color: tw`bg-[#FB7F7F]`,
    textColor: tw`text-white`,
  },
  Upcoming: {
    color: tw`bg-[#F6B83F]`,
    textColor: tw`text-white`,
  },
  None: {
    color: tw`border border-gray-400`,
    textColor: tw`text-gray-400`,
  },
};

export const StatusPill = ({ variant, count }: { variant: EStatus; count: number }) => {
  return (
    <div tw="flex space-x-2 items-center">
      <div
        css={[
          StatusPillVariant[variant].color,
          StatusPillVariant[variant].textColor,
          tw`rounded-sm h-3 w-3 flex items-center justify-center text-sm`,
        ]}
      ></div>
      <Typography fontSize={14}>{count}</Typography>
    </div>
  );
};
