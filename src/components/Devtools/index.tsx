import { Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { Grants } from './Grants';
import { Logs } from './Logs';
import { OrganizationList } from './OrganizationList';
import { Users } from './Users';
import { Resources } from './Resources';
import { Roles } from './Roles';
import 'twin.macro';

export interface ITabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const TabPanel = (props: ITabPanelProps) => {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index ? <div tw="p-2">{children}</div> : null}
    </div>
  );
};

export const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};

export const Devtools = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div tw="w-full">
      <div tw="border-b">
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Users" {...a11yProps(0)} />
          <Tab label="Log Data" {...a11yProps(1)} />
          <Tab label="Grants" {...a11yProps(3)} />
          <Tab label="Organizations" {...a11yProps(3)} />
          <Tab label="Resources" {...a11yProps(4)} />
          <Tab label="Roles" {...a11yProps(5)} />
        </Tabs>
      </div>
      <TabPanel value={value} index={0}>
        <Users />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Logs />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Grants />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <OrganizationList />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Resources />
      </TabPanel>
      <TabPanel value={value} index={5}>
        <Roles />
      </TabPanel>
    </div>
  );
};
