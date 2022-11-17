import { Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { Grants } from './Grants';
import { Logs } from './Logs';
import { Resources } from './Resources';
import { Roles } from './Roles';
import 'twin.macro';
import { a11yProps, TabPanel } from '../Tabs';
import { useUsers } from '../../hooks/api/users';
import { UsersList } from '../ProgramAdmin/UsersList';


export const Devtools = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const usersAllQueryData = useUsers();

  return (
    <div tw="w-full">
      <div tw="border-b">
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Log Data" {...a11yProps(0)} />
          <Tab label="Grants" {...a11yProps(1)} />
          <Tab label="Resources" {...a11yProps(2)} />
          <Tab label="Roles" {...a11yProps(3)} />
          <Tab label="Users" {...a11yProps(4)} />
        </Tabs>
      </div>
      <TabPanel value={value} index={0}>
        <Logs />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Grants />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Resources />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Roles />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <UsersList usersListQuery={usersAllQueryData} />
      </TabPanel>
    </div>
  );
};
