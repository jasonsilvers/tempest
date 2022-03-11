import { useOrgs } from '../hooks/api/organizations';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Autocomplete, TextField, Collapse, ListItemButton, List, ListItemText } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { Organization } from '@prisma/client';
import 'twin.macro';

type OrganizationSelectProps = {
  onChange: (event: SyntheticEvent<Element, Event>, value: Organization) => void;
};

export function OrganizationSelect({ onChange }: OrganizationSelectProps) {
  const orgsQuery = useOrgs();
  const [open, setOpen] = useState({});

  const handleClick = (item: string) => {
    setOpen({ [item]: !open[item] });
  };

  return (
    <Autocomplete
      options={orgsQuery.data ?? []}
      loading={orgsQuery.isLoading}
      getOptionLabel={(option) => option.name}
      onChange={onChange}
      renderGroup={(params) => {
        if (params.group !== '') {
          return (
            <List key={params.group} disablePadding>
              <ListItemButton id={params.key} onClick={(item) => handleClick(item.currentTarget.id)}>
                <ListItemText primary={params.group} />
                {open[params.key] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={open[params.key]} timeout="auto" unmountOnExit>
                {params.children}
              </Collapse>
            </List>
          );
        }

        return params.children;
      }}
      groupBy={(option) => {
        if (option.parentId) {
          return orgsQuery.data.find((org) => org.id === option.parentId).shortName;
        }

        return '';
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          tw="w-full bg-white rounded"
          variant="outlined"
          label="Organizations"
          name="organizations_textfield"
          id="organizations_textfield"
          InputProps={{
            ...params.InputProps,
          }}
        />
      )}
    />
  );
}
