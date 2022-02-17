import {
  DrawerProps,
  Drawer,
  CircularProgress,
  LinearProgress,
  IconButton,
  Menu,
  OutlinedInputProps,
  SelectChangeEvent,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  Dialog as MuiDialog,
  MenuItem as TempestMenuItem,
  Tooltip,
} from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import { useRouter } from 'next/router';
import React, { CSSProperties } from 'react';
import tw, { styled } from 'twin.macro';
import { DeleteIcon, MoreHorizIcon } from '../assets/Icons';

const Card = tw.div`overflow-x-hidden overflow-y-hidden bg-white rounded-md filter drop-shadow-md p-2`;

const TempestDrawer = (props: DrawerProps) => {
  return <Drawer variant="permanent" {...props} />;
};

type TempestModalProps = {
  handleClose: () => void;
};

const DialogTitle = tw(MuiDialogTitle)`pb-1`;
const DialogContent = tw(MuiDialogContent)`pb-1`;
const DialogActions = tw(MuiDialogActions)``;
const Dialog = tw(MuiDialog)``;

const TempestOverlay = tw.div`bg-white absolute top-0 left-0 w-full h-full backdrop-filter backdrop-blur-3xl opacity-50 z-10`;
const TempestSkeleton = tw.div`border border-gray-300 shadow rounded-md`;
const ProgressLayout = tw.div`absolute top-0 right-0`;

const LoadingSpinner = ({ size = '24px' }: { size?: string }) => {
  return <CircularProgress size={size} color="secondary" />;
};

const LoadingOverlay = () => {
  return (
    <TempestOverlay>
      <LinearProgress style={{ borderRadius: '4rem 4rem 0 0', paddingTop: 5 }} variant="indeterminate" />
    </TempestOverlay>
  );
};

const TempestToolTip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)`
  & .MuiTooltip-tooltip {
    background: #dedede;
    color: black;
  }
  & .MuiTooltip-arrow {
    color: #dedede;
  }
`;

export default function DashboardPopMenu({ userId }: { userId: number }) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = () => {
    router.push(`/Profile/${userId}`);
  };

  return (
    <div>
      <IconButton aria-label={`member-popup-menu`} size="small" onClick={handleClick} tw="hover:bg-transparent">
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <TempestMenuItem aria-label="view-member-profile" onClick={handleClose}>
          <span onClick={handleMenuItemClick}>View Member Profile</span>
        </TempestMenuItem>
      </Menu>
    </div>
  );
}

const TempestDatePicker = styled((props) => (
  <DatePicker
    variant="inline"
    aria-label="tempest-date-picker"
    renderInput={({ inputRef, inputProps, InputProps }) => (
      <div tw="flex items-center border border-gray-200 rounded px-2 h-8">
        <input title="date-picker-input" tw="w-20 bg-white text-gray-600" ref={inputRef} {...inputProps} disabled />
        {InputProps?.endAdornment}
      </div>
    )}
    InputProps={{
      role: 'date-picker',
    }}
    {...props}
  />
))`
  & .MuiIconButton-root {
    height: 0.5em;
    width: 0.75em;
  }
`;

const TempestDeleteIcon = tw(DeleteIcon)`text-xl`;

export {
  Card,
  TempestDrawer,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  TempestSkeleton,
  ProgressLayout,
  LoadingSpinner,
  LoadingOverlay,
  TempestToolTip,
  TempestDatePicker,
  TempestDeleteIcon,
};
export type { TempestModalProps, OutlinedInputProps, CSSProperties, SelectChangeEvent };
