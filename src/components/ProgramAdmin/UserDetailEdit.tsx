import {
  Button,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { User } from '@prisma/client';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useQueryClient } from 'react-query';
import { useOrgsLoggedInUsersOrgAndDown } from '../../hooks/api/organizations';
import { useDeleteUser, useUpdateUser } from '../../hooks/api/users';
import { usePermissions } from '../../hooks/usePermissions';
import { UserWithAll } from '../../repositories/userRepo';
import ConfirmDialog from '../Dialog/ConfirmDialog';

import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { Controller, useForm } from 'react-hook-form';
import 'twin.macro';
import { useRoles } from '../../hooks/api/roles';
import { ERole } from '../../const/enums';

const personalFormSchema = Joi.object({
  organizationId: Joi.required(),
  reportingOrganizationId: Joi.required(),
  roleId: Joi.required(),
});

type UserDetailEditProps = { user: UserWithAll; closeEdit: () => void };

export const UserDetailEdit: React.FC<UserDetailEditProps> = ({ user, closeEdit }) => {
  const [deleteModalState, setDeleteModalState] = useState(false);
  const [detachModalState, setDetachModalState] = useState(false);
  const { user: LoggedInUser } = usePermissions();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { dirtyFields },
  } = useForm({
    resolver: joiResolver(personalFormSchema),
    defaultValues: {
      organizationId: user?.organizationId ? user?.organizationId?.toString() : 'none',
      reportingOrganizationId: user?.reportingOrganizationId ? user?.reportingOrganizationId?.toString() : 'none',
      roleId: user?.roleId,
    },
  });
  const updateDisabled = Object.keys(dirtyFields).length === 0;

  const rolesListQuery = useRoles();
  const roles = rolesListQuery?.data?.filter((role) => role.name !== 'norole' && role.name !== 'admin');

  const deleteUserMutation = useDeleteUser();
  const orgsListQuery = useOrgsLoggedInUsersOrgAndDown();

  const mutateUser = useUpdateUser();

  const { enqueueSnackbar } = useSnackbar();

  const deleteUser = (userId: number) => {
    deleteUserMutation.mutate(userId, {
      onSuccess: () => {
        enqueueSnackbar('User Deleted', { variant: 'success' });
        closeEdit();
      },
      onSettled: () => {
        queryClient.invalidateQueries('users');
      },
    });
  };

  const updateUser = (data) => {
    const updatedUser = {
      id: user.id,
      organizationId: parseInt(data.organizationId),
      reportingOrganizationId: data.reportingOrganizationId !== 'none' ? parseInt(data.reportingOrganizationId) : null,
      roleId: data.roleId,
    } as User;

    mutateUser.mutate(updatedUser, {
      onSuccess: () => {
        closeEdit();
        enqueueSnackbar('User Updated!', { variant: 'success' });
      },
      onSettled: () => {
        queryClient.invalidateQueries('users');
      },
    });
  };

  const detachUser = () => {
    const updatedUser = {
      id: user.id,
      organizationId: null,
      reportingOrganizationId: null,
    } as User;
    mutateUser.mutate(updatedUser, {
      onSuccess: () => {
        closeEdit();
        enqueueSnackbar('User Detached!', { variant: 'success' });
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
          <Typography variant="h6">{`${user?.rank} ${user?.lastName}, ${user?.firstName}`}</Typography>
        </div>
        <form id="edit-form" onSubmit={handleSubmit(updateUser)}>
          <div tw="flex flex-col w-full space-y-4 pb-5">
            <Typography>Personal</Typography>
            <Divider />

            {orgsListQuery?.isLoading ? (
              <div>...loading</div>
            ) : (
              <>
                <FormControl fullWidth>
                  <Controller
                    name="organizationId"
                    control={control}
                    render={({ field }) => (
                      <>
                        <InputLabel shrink htmlFor="select-org">
                          Organization
                        </InputLabel>
                        <Select
                          {...field}
                          size="small"
                          fullWidth
                          label="Organization"
                          inputProps={{
                            id: 'select-org',
                            'aria-label': 'select-org',
                          }}
                        >
                          <MenuItem key="noneselected" value="none">
                            No Organization Selected
                          </MenuItem>
                          {orgsListQuery?.data?.map((org) => (
                            <MenuItem key={org.id} value={org.id}>
                              {org.shortName}
                            </MenuItem>
                          ))}
                        </Select>
                      </>
                    )}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <Controller
                    name="reportingOrganizationId"
                    control={control}
                    render={({ field }) => (
                      <>
                        <InputLabel shrink htmlFor="select-report-org">
                          Reporting Organization
                        </InputLabel>
                        <Select
                          {...field}
                          size="small"
                          fullWidth
                          label="Reporting Organization"
                          inputProps={{
                            id: 'select-report-org',
                            'aria-label': 'select-report-org',
                          }}
                        >
                          <MenuItem key="noneselected" value="none">
                            No Reporting Organization Selected
                          </MenuItem>
                          {orgsListQuery?.data?.map((orgData) => (
                            <MenuItem key={orgData.id} value={orgData.id}>
                              {orgData.shortName}
                            </MenuItem>
                          ))}
                        </Select>
                      </>
                    )}
                  />
                </FormControl>
              </>
            )}
          </div>

          <div tw="flex flex-col w-full space-y-4 pb-5">
            <Typography>Permissions</Typography>
            <Divider />
            {rolesListQuery.isLoading ? (
              <div>...loading roles</div>
            ) : (
              <FormControl fullWidth>
                <Controller
                  name="roleId"
                  control={control}
                  render={({ field }) => (
                    <>
                      <InputLabel shrink htmlFor="select-role">
                        Role
                      </InputLabel>
                      <Select
                        {...field}
                        size="small"
                        label="Role"
                        fullWidth
                        inputProps={{
                          id: 'select-roles',
                          'aria-label': 'select-roles',
                        }}
                      >
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </>
                  )}
                />
              </FormControl>
            )}
          </div>
        </form>

        {user.organizationId !== null && (
          <Button variant="outlined" color="primary" onClick={() => setDetachModalState(true)}>
            DETACH MEMBER
          </Button>
        )}

        {LoggedInUser?.role.name === ERole.ADMIN ? (
          <Button color="error" variant="outlined" onClick={() => setDeleteModalState(true)}>
            Delete
          </Button>
        ) : null}

        <div tw="p-5 pt-20 flex space-x-4 justify-evenly">
          <Button variant="outlined" color="secondary" onClick={closeEdit}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" form="edit-form" disabled={updateDisabled}>
            UPDATE
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={deleteModalState}
        handleNo={() => setDeleteModalState(false)}
        handleYes={() => {
          setDeleteModalState(false);
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
      <ConfirmDialog
        open={detachModalState}
        handleNo={() => setDetachModalState(false)}
        handleYes={() => {
          setDeleteModalState(false);
          detachUser();
        }}
      >
        <DialogTitle tw="text-red-400">WARNING!</DialogTitle>
        <DialogContent>
          <div tw="py-4 text-red-400">THIS ACTION WILL REMOVE THE USER FROM YOUR ORGANIZATION</div>
          <div>Are you sure you want to continue?</div>
        </DialogContent>
      </ConfirmDialog>
    </>
  );
};
