import { Role, User } from '.prisma/client';
import axios from 'axios';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import tw from 'twin.macro';
import { EUri } from '../../const/enums';
import { useOrgs } from '../../hooks/api/organizations';
import { useUpdateUser } from '../../hooks/api/users';
import { usePermissions } from '../../hooks/usePermissions';
import { Button, DialogContent, DialogTitle, MenuItem, Select, SelectChangeEvent } from '../../lib/ui';
import { UserWithAll } from '../../repositories/userRepo';
import { RolesDTO, UsersDTO } from '../../types';
import ConfirmDialog from '../Dialog/ConfirmDialog';

const Data = tw.div`font-light text-gray-400`;
type RoleFormEvent = SelectChangeEvent<number>;
type OrgFormEvent = SelectChangeEvent<string>;

const Users = () => {
  const [modalState, setModalState] = useState({ userId: null, open: false });
  const queryClient = useQueryClient();
  const { user: LoggedInUser } = usePermissions();
  const usersListQuery = useQuery<UserWithAll[]>('users', () =>
    axios.get<UsersDTO>(EUri.USERS).then((response) => response.data.users)
  );

  const rolesListQuery = useQuery<Role[]>('roles', () =>
    axios.get<RolesDTO>(EUri.ROLES).then((response) => response.data.roles)
  );

  const deleteUserMutation = useMutation((userId: string) =>
    axios.delete(`${EUri.USERS}${userId}`).then((result) => result.data)
  );
  const orgsListQuery = useOrgs();

  const mutateUser = useUpdateUser();

  const { enqueueSnackbar } = useSnackbar();

  const deleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId, {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        enqueueSnackbar('User Deleted', { variant: 'success' });
      },
      onSettled: () => {
        queryClient.invalidateQueries('users');
      },
    });
  };

  const updateUsersOrg = (event: OrgFormEvent, user: UserWithAll) => {
    const selectedOrgId = event.target.value;

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
  };

  const updateUsersRole = (event: RoleFormEvent, user: UserWithAll) => {
    const selectedRoleId = event.target.value;

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
  };

  if (usersListQuery.isLoading) {
    return <div>...loading users</div>;
  }

  return (
    <div tw="p-6">
      {usersListQuery?.data.map((user) => {
        return (
          <div key={user.id} tw="flex items-center p-2">
            <Data>
              {user.firstName} {user.lastName}
            </Data>
            <div tw="px-2">|</div>
            <Data>{user.lastLogin ? dayjs(user.lastLogin).format('D MMM YYYY @ HH:mm') : 'Never'}</Data>
            <div tw="px-2">|</div>
            <div tw="flex flex-row items-center space-x-2">
              <Data>Org:</Data>
              {orgsListQuery.isLoading ? (
                <div>...loading</div>
              ) : (
                <Select
                  onChange={(event: OrgFormEvent) => updateUsersOrg(event, user)}
                  tw="text-gray-400"
                  size="small"
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
            <div tw="px-2">|</div>
            <div tw="flex flex-row items-center space-x-2">
              <Data>Role:</Data>
              {rolesListQuery.isLoading ? (
                <div>...loading</div>
              ) : (
                <div>
                  <Select
                    onChange={(event) => updateUsersRole(event, user)}
                    tw="text-gray-400"
                    size="small"
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
            <div tw="ml-auto">
              {LoggedInUser.id !== user.id ? (
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={() => setModalState({ userId: user.id, open: true })}
                >
                  Delete
                </Button>
              ) : null}
            </div>
          </div>
        );
      })}
      <ConfirmDialog
        open={modalState.open}
        handleNo={() => setModalState({ userId: null, open: false })}
        handleYes={() => {
          setModalState({ userId: null, open: false });
          deleteUser(modalState.userId);
        }}
      >
        <DialogTitle tw="text-red-400">WARNING!</DialogTitle>
        <DialogContent>
          <div>This action is irreversible</div>
          <div tw="py-4 text-red-400">IT WILL DELETE THE USER AND ALL ASSOCIATED RECORDS</div>
          <div>Are you sure you want to continue?</div>
        </DialogContent>
      </ConfirmDialog>
    </div>
  );
};

export { Users };
