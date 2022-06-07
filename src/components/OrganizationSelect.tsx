import { Autocomplete, TextField } from '@mui/material';
import { Organization } from '@prisma/client';
import { SyntheticEvent } from 'react';
import 'twin.macro';
import { useOrgs } from '../hooks/api/organizations';

type OrganizationSelectProps = {
  onChange: (event: SyntheticEvent<Element, Event>, value: Organization) => void;
};

export function OrganizationSelect({ onChange }: OrganizationSelectProps) {
  const orgsQuery = useOrgs();
  return (
    <Autocomplete
      options={orgsQuery.data ?? []}
      loading={orgsQuery.isLoading}
      getOptionLabel={(option: Organization) => option.name}
      onChange={onChange}
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
