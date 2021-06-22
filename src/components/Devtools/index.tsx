import { SecurityIcon } from '../../assets/Icons';
import { Fab, Drawer, Button } from '../../lib/ui';
import tw from 'twin.macro';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import { usePermissions } from '../../hooks/usePermissions';
import { ERole } from '../../types/global';
import { LoggedInUser } from '../../repositories/userRepo';
import { MenuItem, Select } from '@material-ui/core';
import { Organization, Role, User } from '.prisma/client';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';

const Data = tw.div`font-light text-gray-400`;
type RoleFormEvent = React.ChangeEvent<{ value: number }>;
type OrgFormEvent = React.ChangeEvent<{ value: string }>;

const UsersList = () => {
  const queryClient = useQueryClient();
  const usersListQuery = useQuery<LoggedInUser[]>('users', () =>
    axios.get('/api/users').then((response) => response.data)
  );

  const rolesListQuery = useQuery<Role[]>('roles', () => axios.get('/api/roles').then((response) => response.data));
  const orgsListQuery = useQuery<Organization[]>('organizations', () =>
    axios.get('/api/organizations').then((response) => response.data)
  );

  const mutateUser = useMutation<User, unknown, User>(
    (user: User) => axios.put(`/api/users/${user.id}`, user).then((response) => response.data),
    {
      onSettled: () => {
        queryClient.invalidateQueries('users');
      },
    }
  );

  const { enqueueSnackbar } = useSnackbar();

  const updateUsersOrg = (event: OrgFormEvent, user: LoggedInUser) => {
    const selectedOrgId = event.target.value;

    if (selectedOrgId !== user.organizationId) {
      const { organization, role, ...userToUpdate } = user; // eslint-disable-line
      const updatedUser: User = {
        ...userToUpdate,
        organizationId: selectedOrgId,
      };
      mutateUser.mutate(updatedUser, {
        onSuccess: () => {
          enqueueSnackbar('Organization Changed', { variant: 'success' });
        },
      });
    }
  };

  const updateUsersRole = (event: RoleFormEvent, user: LoggedInUser) => {
    const selectedRoleId = event.target.value;

    if (selectedRoleId !== user.role.id) {
      const { organization, role, ...userToUpdate } = user; // eslint-disable-line
      const updatedUser: User = {
        ...userToUpdate,
        roleId: selectedRoleId,
      };

      mutateUser.mutate(updatedUser, {
        onSuccess: () => {
          enqueueSnackbar('Role Changed', { variant: 'success' });
        },
      });
    }
  };

  if (usersListQuery.isLoading) {
    return <div>...loading users</div>;
  }

  return (
    <div tw="pl-48 pb-4">
      <div tw="text-lg pb-2 underline">Users</div>
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
                      value={user.role.id}
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

const DevDrawer = ({ showDrawer, toggleDrawer }: { showDrawer: boolean; toggleDrawer: () => void }) => {
  return (
    <>
      <Drawer anchor="bottom" open={showDrawer}>
        <div tw="ml-auto pt-2 pr-2">
          <Button size="small" variant="contained" onClick={toggleDrawer}>
            Close
          </Button>
        </div>
        <UsersList />
      </Drawer>
    </>
  );
};

const FabLayout = tw.div`fixed bottom-4 right-4`;

const Devtools = () => {
  const [showDrawer, toggleDrawer] = useState(false);
  const { role } = usePermissions();

  if (role !== ERole.ADMIN) {
    return null;
  }

  return (
    <>
      <FabLayout>
        <Fab size="small" onClick={() => toggleDrawer((old) => !old)}>
          <SecurityIcon fontSize="small"></SecurityIcon>
        </Fab>
      </FabLayout>
      <DevDrawer showDrawer={showDrawer} toggleDrawer={() => toggleDrawer((old) => !old)} />
    </>
  );
};

export { Devtools };
