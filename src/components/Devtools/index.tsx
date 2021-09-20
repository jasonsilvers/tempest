import { SecurityIcon } from '../../assets/Icons';
import { Fab, Drawer, Button } from '../../lib/ui';
import tw from 'twin.macro';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import { usePermissions } from '../../hooks/usePermissions';
import { UserWithAll } from '../../repositories/userRepo';
import { MenuItem, Select } from '@material-ui/core';
import { Organization, Role, User } from '.prisma/client';
import { useSnackbar } from 'notistack';
import { UsersDTO, RolesDTO, OrgsDTO, ERole, EUri } from '../../types/global';
import { useOrgs } from '../../hooks/api/organizations';
const dayjs = require('dayjs');

const Data = tw.div`font-light text-gray-400`;
type RoleFormEvent = React.ChangeEvent<{ value: number }>;
type OrgFormEvent = React.ChangeEvent<{ value: string }>;

const UsersList = () => {
  const queryClient = useQueryClient();
  const usersListQuery = useQuery<UserWithAll[]>('users', () =>
    axios.get<UsersDTO>(EUri.USERS).then((response) => response.data.users)
  );

  const rolesListQuery = useQuery<Role[]>('roles', () =>
    axios.get<RolesDTO>(EUri.ROLES).then((response) => response.data.roles)
  );
  const orgsListQuery = useOrgs();

  const mutateUser = useMutation<User, unknown, User>(
    (user: User) => axios.put(EUri.USERS + `${user.id}`, user).then((response) => response.data),
    {
      onSettled: () => {
        queryClient.invalidateQueries('users');
      },
    }
  );

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
          enqueueSnackbar('Organization Changed', { variant: 'success' });
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
    <div id="devtoolfab">
      <FabLayout>
        <Fab aria-label="devtool-button" size="small" onClick={() => toggleDrawer((old) => !old)}>
          <SecurityIcon fontSize="small"></SecurityIcon>
        </Fab>
      </FabLayout>
      <DevDrawer showDrawer={showDrawer} toggleDrawer={() => toggleDrawer((old) => !old)} />
    </div>
  );
};

export { Devtools };
