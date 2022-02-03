import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import tw, { styled } from 'twin.macro';
import MuiDialog from '@mui/material/Dialog';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import Fab from '@mui/material/Fab';
import ToolTip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import Menu from '@mui/material/Menu';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import TempestMenuItem from '@mui/material/MenuItem';
import { DeleteIcon, MoreHorizIcon } from '../assets/Icons';
import React from 'react';
import { useRouter } from 'next/router';
import DatePicker from '@mui/lab/DatePicker';
import { DataGrid } from '@mui/x-data-grid';
import FormControl from '@mui/material/FormControl';
import { DialogContentText, OutlinedInput, OutlinedInputProps } from '@mui/material';
import { MenuItem, Select } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { CSSProperties } from '@mui/styles/withStyles';
import Drawer, { DrawerProps } from '@mui/material/Drawer';

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
const ProgressLayout = tw.div`absolute top-2 right-2`;

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

const TempestToolTip = styled(({ className, ...props }) => <ToolTip {...props} classes={{ popper: className }} />)`
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
  DashboardPopMenu,
  TempestMenuItem,
  TempestDrawer,
  IconButton,
  CircularProgress,
  Link,
  Card,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  InputAdornment,
  OutlinedInput,
  Button,
  Dialog,
  TextField,
  Autocomplete,
  LoadingOverlay,
  LoadingSpinner,
  MenuItem,
  Select,
  ProgressLayout,
  Fab,
  FormControl,
  Drawer,
  TempestSkeleton,
  TempestToolTip,
  TempestDatePicker,
  TempestDeleteIcon,
  Zoom,
  Box,
  Tab,
  Tabs,
  Typography,
  DataGrid,
};

export type { TempestModalProps, OutlinedInputProps, CSSProperties, SelectChangeEvent };
