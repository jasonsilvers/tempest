import { Dialog, DialogActions } from '../../lib/ui';
import 'twin.macro';
import { Button } from '@mui/material';

interface IConfirmDialogProps {
  handleNo: () => void;
  handleYes: () => void;
  open: boolean;
}

const ConfirmDialog: React.FC<IConfirmDialogProps> = ({ children, open, handleNo, handleYes }) => {
  return (
    <Dialog open={open}>
      <div tw="p-5">{children}</div>
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
