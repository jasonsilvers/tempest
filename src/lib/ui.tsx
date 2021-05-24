import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Link';
import tw from 'twin.macro';
import MuiDialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

const TempestPaper = tw.div`bg-primary text-white w-64 pl-6 pt-9`;

const TempestDrawer = (props) => {
  return (
    <Drawer
      variant="permanent"
      PaperProps={{ component: TempestPaper }}
      {...props}
    />
  );
};

type TempestModalProps = {
  handleClose: () => void;
};

const DialogTitle = tw(MuiDialogTitle)`pb-1`;
const DialogContent = tw(MuiDialogContent)`pb-1`;
const DialogActions = tw(MuiDialogActions)``;
const DialogButton = tw(Button)`w-32 normal-case bg-primary text-white`;
const Dialog = tw(MuiDialog)``;

const TempestOverlay = tw.div`bg-white absolute top-0 left-0 w-full h-full backdrop-filter backdrop-blur-3xl opacity-50 z-10`;

const LoadingOverlay = () => {
  return (
    <TempestOverlay>
      <LinearProgress
        style={{ borderRadius: '4rem 4rem 0 0', paddingTop: 5 }}
        variant="indeterminate"
      />
    </TempestOverlay>
  );
};

export {
  TempestDrawer,
  IconButton,
  CircularProgress,
  Link,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogButton,
  Dialog,
  TextField,
  Autocomplete,
  LoadingOverlay,
};

export type { TempestModalProps };
