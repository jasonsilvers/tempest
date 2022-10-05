import { Organization, User } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import { useSnackbar } from 'notistack';
import React, { CSSProperties } from 'react';
import 'twin.macro';
import { useOrgsAll } from '../hooks/api/organizations';
import { useUpdateUser } from '../hooks/api/users';
import { OrganizationSelect } from './OrganizationSelect';

export const UpdateUsersOrg = ({
  userId,
  userOrganizationId,
  onChange = null,
}: {
  userId: number;
  userOrganizationId?: number;
  onChange?: (org: Organization) => void;
  label?: string;
  editStyle?: CSSProperties;
}) => {
  const { refreshUser } = useUser();
  const orgsQuery = useOrgsAll();
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

  return <OrganizationSelect onChange={updateOrg} />;
};
