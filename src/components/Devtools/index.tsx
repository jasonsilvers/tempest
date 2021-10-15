import { SecurityIcon } from '../../assets/Icons';
import { Fab, Drawer, Button } from '../../lib/ui';
import tw from 'twin.macro';
import { useState } from 'react';
import { Users, TabPanel, BasicTabs } from './User';
import { usePermissions } from '../../hooks/usePermissions';
import { ERole } from '../../const/enums';
import { Tab } from '@mui/material';

const DevDrawer = ({ showDrawer, toggleDrawer }: { showDrawer: boolean; toggleDrawer: () => void }) => {
  return (
    <>
      <Drawer anchor="bottom" open={showDrawer}>
        <div tw="ml-auto pt-2 pr-2">
          <Button size="small" variant="contained" onClick={toggleDrawer}>
            Close
          </Button>
        </div>
        <BasicTabs />
      </Drawer>
    </>
  );
};

const FabLayout = tw.div`fixed bottom-4 right-4`;

const Devtools = () => {
  const [showDrawer, toggleDrawer] = useState(false);
  const { role } = usePermissions();

  if (role !== ERole.ADMIN) {
    return null;
  }

  return (
    <div id="devtoolfab">
      <FabLayout>
        <Fab aria-label="devtool-button" size="small" onClick={() => toggleDrawer((old) => !old)}>
          <SecurityIcon fontSize="small"></SecurityIcon>
        </Fab>
      </FabLayout>
      <DevDrawer showDrawer={showDrawer} toggleDrawer={() => toggleDrawer((old) => !old)} />
    </div>
  );
};

export { Devtools };
