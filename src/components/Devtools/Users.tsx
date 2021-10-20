import { useOrgs } from '../../hooks/api/organizations';
import { useUpdateUser } from '../../hooks/api/users';
import { RolesDTO, UsersDTO } from '../../types';
import { UserWithAll } from '../../repositories/userRepo';
import { MenuItem, Select } from '@material-ui/core';
import { Role, User } from '.prisma/client';
import { useSnackbar } from 'notistack';
import { EUri } from '../../const/enums';
import { useQuery } from 'react-query';
import { useQueryClient } from 'react-query';
import React from 'react';
import axios from 'axios';
import tw from 'twin.macro';

const dayjs = require('dayjs');

const Data = tw.div`font-light text-gray-400`;
type RoleFormEvent = React.ChangeEvent<{ value: number }>;
type OrgFormEvent = React.ChangeEvent<{ value: string }>;

const Users = () => {
  const queryClient = useQueryClient();
  const usersListQuery = useQuery<UserWithAll[]>('users', () =>
    axios.get<UsersDTO>(EUri.USERS).then((response) => response.data.users)
  );

  const rolesListQuery = useQuery<Role[]>('roles', () =>
    axios.get<RolesDTO>(EUri.ROLES).then((response) => response.data.roles)
  );
  const orgsListQuery = useOrgs();

  const mutateUser = useUpdateUser();

  const { enqueueSnackbar } = useSnackbar();

  const updateUsersOrg = (event: OrgFormEvent, user: UserWithAll) => {
    const selectedOrgId = event.target.value;

    if (selectedOrgId !== user.organizationId) {
      const updatedUser = {
        id: user.id,
        organizationId: selectedOrgId,
      } as User;
      mutateUser.mutate(updatedUser, {
        onSuccess: () => {
          queryClient.invalidateQueries('users');
          enqueueSnackbar('Organization Changed', { variant: 'success' });
        },
        onSettled: () => {
          queryClient.invalidateQueries('users');
        },
      });
    }
  };

  const updateUsersRole = (event: RoleFormEvent, user: UserWithAll) => {
    const selectedRoleId = event.target.value;

    if (selectedRoleId !== user.role?.id) {
      const updatedUser = {
        id: user.id,
        roleId: selectedRoleId,
      } as User;

      mutateUser.mutate(updatedUser, {
        onSuccess: () => {
          queryClient.invalidateQueries('users');

          enqueueSnackbar('Role Changed', { variant: 'success' });
        },
        onSettled: () => {
          queryClient.invalidateQueries('users');
        },
      });
    }
  };

  if (usersListQuery.isLoading) {
    return <div>...loading users</div>;
  }

  return (
    <div tw="p-6">
      {usersListQuery?.data.map((user) => {
        return (
          <div key={user.id}>
            <div tw="flex flex-row space-x-2 h-10 items-center">
              <Data>
                {user.firstName} {user.lastName}
              </Data>
              <div>|</div>
              <Data>last login: {dayjs(user.lastLogin).format('D MMM YYYY @ HH:mm') ?? 'Never'}</Data>
              <div>|</div>
              <div tw="flex flex-row items-center space-x-2">
                <Data>Org:</Data>
                {orgsListQuery.isLoading ? (
                  <div>...loading</div>
                ) : (
                  <Select
                    onChange={(event: OrgFormEvent) => updateUsersOrg(event, user)}
                    tw="text-gray-400"
                    value={user.organizationId}
                  >
                    {orgsListQuery.data.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </div>
              <div>|</div>
              <div tw="flex flex-row items-center space-x-2">
                <Data>Role:</Data>
                {rolesListQuery.isLoading ? (
                  <div>...loading</div>
                ) : (
                  <div>
                    <Select
                      onChange={(event: RoleFormEvent) => updateUsersRole(event, user)}
                      tw="text-gray-400"
                      value={user.role?.id}
                    >
                      {rolesListQuery.data.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { Users };
