import {
  Select,
  MenuItem,
  Button,
  DialogTitle,
  DialogContent,
  SelectChangeEvent,
  Typography,
  Divider,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Role, User } from '@prisma/client';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import { EUri } from '../../const/enums';
import { useOrgs } from '../../hooks/api/organizations';
import { useUpdateUser } from '../../hooks/api/users';
import { usePermissions } from '../../hooks/usePermissions';
import { UserWithAll } from '../../repositories/userRepo';
import { RolesDTO } from '../../types';
import ConfirmDialog from '../Dialog/ConfirmDialog';

import 'twin.macro';

type RoleFormEvent = SelectChangeEvent<number>;
type OrgFormEvent = SelectChangeEvent<string>;

export const UserDetailEdit = ({ user }: { user: UserWithAll }) => {
  const [modalState, setModalState] = useState(false);
  const { user: LoggedInUser } = usePermissions();
  const queryClient = useQueryClient();
  const rolesListQuery = useQuery<Role[]>('roles', () =>
    axios.get<RolesDTO>(EUri.ROLES).then((response) => response.data.roles)
  );

  const deleteUserMutation = useMutation((userId: number) =>
    axios.delete(`${EUri.USERS}${userId}`).then((result) => result.data)
  );
  const orgsListQuery = useOrgs();

  const mutateUser = useUpdateUser();

  const { enqueueSnackbar } = useSnackbar();

  const deleteUser = (userId: number) => {
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

  const updateUsersOrg = (event: OrgFormEvent) => {
    const selectedOrgId = parseInt(event.target.value);

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

  const updateUsersRole = (event: RoleFormEvent) => {
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
  return (
    <>
      <div tw="flex flex-col pt-5 px-3 space-y-4">
        <div tw="flex flex-col pb-6 items-center space-y-4">
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Member Selected:
          </Typography>
          <Typography variant="h6">{`${user.rank} ${user.lastName}, ${user.firstName}`}</Typography>
        </div>
        <div tw="flex flex-col w-full space-y-4 pb-5">
          <Typography>Personal</Typography>
          <Divider />
          {orgsListQuery?.isLoading ? (
            <div>...loading</div>
          ) : (
            <FormControl>
              <InputLabel shrink htmlFor="select-org">
                Organization
              </InputLabel>
              <Select
                onChange={(event: OrgFormEvent) => updateUsersOrg(event)}
                size="small"
                value={user.organizationId?.toString()}
                fullWidth
                label="Organization"
                inputProps={{
                  id: 'select-org',
                }}
              >
                {orgsListQuery?.data?.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.shortName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
        <div tw="flex flex-col w-full space-y-4">
          <Typography>Permissions</Typography>
          <Divider />
          {rolesListQuery.isLoading ? (
            <div>...loading</div>
          ) : (
            <FormControl>
              <InputLabel shrink htmlFor="select-role">
                Role
              </InputLabel>
              <Select
                onChange={(event) => updateUsersRole(event)}
                size="small"
                label="Role"
                fullWidth
                value={user.role?.id}
              >
                {rolesListQuery?.data?.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>

        <Button variant="outlined" color="primary">
          UNATTACH MEMBER
        </Button>
        <div tw="flex flex-col items-center p-5">
          {LoggedInUser?.id !== user.id ? (
            <Button color="error" variant="contained" onClick={() => setModalState(true)}>
              Delete
            </Button>
          ) : null}
        </div>
      </div>
      <ConfirmDialog
        open={modalState}
        handleNo={() => setModalState(false)}
        handleYes={() => {
          setModalState(false);
          deleteUser(user.id);
        }}
      >
        <DialogTitle tw="text-red-400">WARNING!</DialogTitle>
        <DialogContent>
          <div>This action is irreversible</div>
          <div tw="py-4 text-red-400">IT WILL DELETE THE USER AND ALL ASSOCIATED RECORDS</div>
          <div>Are you sure you want to continue?</div>
        </DialogContent>
      </ConfirmDialog>
    </>
  );
};
