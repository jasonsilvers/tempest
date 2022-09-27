import { Card, Drawer, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { a11yProps, TabPanel } from '../components/Tabs';
import { EFuncAction, EResource } from '../const/enums';
import { usePermissions } from '../hooks/usePermissions';

import 'twin.macro';
import { Users } from '../components/ProgramAdmin/Users';
import { OrganizationList } from '../components/ProgramAdmin/OrganizationList';

const drawerWidth = 240;

function ProgramAdminPage() {
  const { user, permissionCheck, isLoading } = usePermissions();

  const canViewAdminPage = permissionCheck(user?.role.name, EFuncAction.READ_ANY, EResource.PROGRAM_ADMIN);

  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (isLoading) {
    return <div>...loading</div>;
  }

  if (!canViewAdminPage?.granted) {
    return <div>You do not have access to this page</div>;
  }

  return (
    <main tw="p-5 width[1200px]">
      <Card>
        <div tw="w-full">
          <div tw="border-b">
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Users" {...a11yProps(0)} />

              <Tab label="Organizations" {...a11yProps(1)} />
            </Tabs>
          </div>
          <TabPanel value={value} index={0}>
            <Users />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <OrganizationList />
          </TabPanel>
        </div>
      </Card>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="right"
        open={false}
      >
        Test
      </Drawer>
    </main>
  );
}

export default ProgramAdminPage;
