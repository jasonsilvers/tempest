import { Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { Grants } from './Grants';
import { Logs } from './Logs';
import { Resources } from './Resources';
import { Roles } from './Roles';
import 'twin.macro';
import { a11yProps, TabPanel } from '../Tabs';
import { TrackingItemsList } from './TrackingItems';

export const Devtools = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div tw="w-full">
      <div tw="border-b">
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Tracking Items" {...a11yProps(0)} />
          <Tab label="Log Data" {...a11yProps(1)} />
          <Tab label="Grants" {...a11yProps(2)} />
          <Tab label="Resources" {...a11yProps(3)} />
          <Tab label="Roles" {...a11yProps(4)} />
        </Tabs>
      </div>
      <TabPanel value={value} index={0}>
        <TrackingItemsList />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Logs />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Grants />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Resources />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Roles />
      </TabPanel>
    </div>
  );
};
