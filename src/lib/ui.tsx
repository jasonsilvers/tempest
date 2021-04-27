import Drawer from '@material-ui/core/Drawer';
import tw from 'twin.macro';

const TempestPaper = tw.div`bg-primary text-white w-64 pl-6 pt-9`;

export const TempestDrawer = (props) => {
  return (
    <Drawer variant="permanent" PaperProps={{component: TempestPaper}} {...props} />
  );
};








