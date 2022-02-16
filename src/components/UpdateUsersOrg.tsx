import { useOrgs } from '../hooks/api/organizations';
import { useUpdateUser } from '../hooks/api/users';
import { Autocomplete, TextField } from '@mui/material';
import { Organization, User } from '@prisma/client';
import { useSnackbar } from 'notistack';
import { useUser } from '@tron/nextjs-auth-p1';

import 'twin.macro';
import React, { CSSProperties } from 'react';

export const UpdateUsersOrg = ({
  userId,
  userOrganizationId = '',
  onChange = null,
  label = '',
  editStyle,
}: {
  userId: number;
  userOrganizationId: string;
  onChange?: (org: Organization) => void;
  label?: string;
  editStyle?: CSSProperties;
}) => {
  const { refreshUser } = useUser();
  const orgsQuery = useOrgs();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate: updateUser } = useUpdateUser();

  const updateOrg = (_, selectedOrg) => {
    // if the selected org from the autocomplete field is null aka a user cleared the text then return nothing
    if (!selectedOrg) {
      return null;
    }
    // if no onchange function execute update on change of org id
    if (!onChange && selectedOrg.id !== userOrganizationId) {
      const updatedUser = {
        id: userId,
        organizationId: selectedOrg.id,
      } as User;
      updateUser(updatedUser, {
        onSuccess: () => {
          refreshUser();
          enqueueSnackbar('Organization Changed', { variant: 'success' });
        },
      });
    }
    if (onChange) {
      onChange(selectedOrg);
    }
  };

  if (orgsQuery.isLoading) {
    return <div>...loading</div>;
  }

  return (
    <Autocomplete
      defaultValue={orgsQuery.data?.find((org) => org.id === userOrganizationId)}
      options={orgsQuery.data ?? []}
      getOptionLabel={(option) => option.name}
      onChange={updateOrg}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="filled"
          size="small"
          label={label}
          name={`${label}_textfield`}
          id={`${label}_textfield`}
          style={{ paddingRight: '1rem', ...editStyle }}
          InputProps={{
            ...params.InputProps,
          }}
        />
      )}
    />
  );
};
