import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import tw from 'twin.macro';

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

export { TempestDrawer, IconButton, CircularProgress };
