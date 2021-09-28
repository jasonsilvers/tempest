import { DialogActions } from '@material-ui/core';
import { Dialog, Button } from '../../lib/ui';

interface IConfirmDialogProps {
  handleNo: () => void;
  handleYes: () => void;
  open: boolean;
}

const ConfirmDialog: React.FC<IConfirmDialogProps> = ({ children, open, handleNo, handleYes }) => {
  return (
    <Dialog open={open}>
      {children}
      <DialogActions>
        <Button onClick={handleYes} color="primary">
          Yes
        </Button>
        <Button onClick={handleNo} color="primary">
          No
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
