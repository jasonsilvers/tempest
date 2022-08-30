import {
  Box,
  CircularProgress,
  CircularProgressProps,
  Dialog as MuiDialog,
  DialogActions as MuiDialogActions,
  DialogContent as MuiDialogContent,
  DialogTitle as MuiDialogTitle,
  Drawer,
  DrawerProps,
  IconButton,
  LinearProgress,
  OutlinedInputProps,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CSSProperties } from 'react';
import tw, { css, styled } from 'twin.macro';
import { DeleteIcon, EventIcon } from '../assets/Icons';

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

const litCompletionDate = tw`placeholder:text-secondary`;
const litInputBorder = tw`border-secondary`;

const noCompletionDateStyles = css`
  ${litCompletionDate}
`;

const TempestDatePicker = styled((props) => (
  <DatePicker
    variant="inline"
    aria-label="tempest-date-picker"
    renderInput={({ inputRef, inputProps, InputProps }) => {
      const inputIsNull = inputProps.value === '';

      return (
        <div
          css={[
            tw`flex items-center border rounded px-2 h-8`,
            inputIsNull &&
              css`
                ${litInputBorder}
              `,
          ]}
        >
          <input
            title="date-picker-input"
            css={[tw`w-20 bg-white ml-2`, inputIsNull && noCompletionDateStyles]}
            ref={inputRef}
            {...inputProps}
            disabled
          />
          <IconButton
            // @ts-expect-error
            {...InputProps.endAdornment?.props.children.props}
            aria-label="calendar-open-button"
          >
            <EventIcon color={inputIsNull ? 'secondary' : 'inherit'} />
          </IconButton>
        </div>
      );
    }}
    InputProps={{
      role: 'date-picker',
    }}
    {...props}
  />
))(() => ({}));

const TempestDeleteIcon = tw(DeleteIcon)`text-xl`;

function CircularProgressWithLabel(props: CircularProgressProps & { value: number }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress size="90px" variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body1" component="div" color="text.secondary">{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export {
  Card,
  TempestDrawer,
  CircularProgressWithLabel,
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
