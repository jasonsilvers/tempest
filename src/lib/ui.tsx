import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Link';
import tw from 'twin.macro';
import styled from 'styled-components';
import MuiDialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Fab from '@material-ui/core/Fab';
import ToolTip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';
import Paper from '@material-ui/core/Paper';
import SearchBar from '@snekcode/mui-search-bar';
import Menu from '@material-ui/core/Menu';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import TempestMenuItem from '@material-ui/core/MenuItem';
import { DeleteIcon, MoreHorizIcon } from '../assets/Icons';
import React from 'react';
import { useRouter } from 'next/router';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { DataGrid, useGridSlotComponentProps } from '@material-ui/data-grid';
import FormControl from '@material-ui/core/FormControl';
import { DialogContentText, OutlinedInput, OutlinedInputProps } from '@material-ui/core';

const TPaper = styled(Paper)`
  background-color: #fff;
  width: 16rem;
  padding-left: 1.5rem;
  padding-top: 2.25rem;
  color: #2d2270;
`;

const TempestDrawer = (props) => {
  return <Drawer variant="permanent" PaperProps={{ component: TPaper }} {...props} />;
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

export default function TempestPopMenu({ userId }: { userId: string }) {
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
        getContentAnchorEl={null}
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
  <KeyboardDatePicker
    disableToolbar
    variant="inline"
    aria-label="tempest-date-picker"
    TextFieldComponent={(keyboardDatePickerProps) => (
      <TextField {...keyboardDatePickerProps} disabled aria-label="tempest-date-picker" />
    )}
    InputProps={{
      role: 'date-picker',
    }}
    {...props}
  />
))`
  & .MuiInputBase-input {
    padding: 6px;
    font-size: 12px;
    opacity: 60%;
    width: 70px;
    font-weight: 400;
    color: black;
  }
  & .MuiInputBase-adornedEnd {
    padding-right: 6px;
  }
  & .MuiInputBase-input::-webkit-calendar-picker-indicator {
    margin: 0;
  }

  & .MuiButtonBase-root {
    padding: 1px;
  }

  & .MuiSvgIcon-root {
    height: 0.75em;
    width: 0.75em;
  }
`;

const TempestDeleteIcon = tw(DeleteIcon)`text-xl`;

export {
  TempestPopMenu,
  TempestMenuItem,
  TempestDrawer,
  IconButton,
  CircularProgress,
  Link,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  OutlinedInput,
  Button,
  Dialog,
  TextField,
  Autocomplete,
  LoadingOverlay,
  LoadingSpinner,
  ProgressLayout,
  Fab,
  FormControl,
  Drawer,
  TempestSkeleton,
  TempestToolTip,
  TempestDatePicker,
  TempestDeleteIcon,
  Zoom,
  SearchBar,
  Box,
  Tab,
  Tabs,
  Typography,
  DataGrid,
  useGridSlotComponentProps,
};

export type { TempestModalProps, OutlinedInputProps };
