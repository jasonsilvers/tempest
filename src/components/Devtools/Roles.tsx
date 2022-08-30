import { joiResolver } from '@hookform/resolvers/joi';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
} from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColumns, GridToolbarContainer, GridRowParams } from '@mui/x-data-grid';
import Joi from 'joi';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import 'twin.macro';
import { AddIcon, DeleteIcon } from '../../assets/Icons';
import { ERole } from '../../const/enums';
import { useRoles, useCreateRole, useDeleteRole, NewRole } from '../../hooks/api/roles';
import { diffBetweenEnumAndServer } from './utils';

const rolesFormSchema = Joi.object({
  name: Joi.string()
    .required()
    .invalid(...['none']),
});

const roles = Object.values(ERole);

const AddRoleDialog = ({ isOpen, setIsOpen }) => {
  const { mutate: createRole } = useCreateRole();
  const rolesQuery = useRoles();
  const snackbar = useSnackbar();

  const [localRoles, setLocalRoles] = useState([]);

  useEffect(() => {
    if (rolesQuery.data?.length > 0) {
      const diffBetweenLocalAndServerResources = diffBetweenEnumAndServer(roles, rolesQuery.data);

      setLocalRoles(diffBetweenLocalAndServerResources);
    }
  }, [rolesQuery.data]);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(rolesFormSchema),
    defaultValues: {
      name: 'none',
    },
  });

  const resetValues = () => {
    reset({ name: 'none' });
  };
  const onSubmit = (data: NewRole) => {
    createRole(data, {
      onSuccess: () => {
        snackbar.enqueueSnackbar('Role Added!', { variant: 'success' });
        resetValues();
        setIsOpen(false);
      },
    });
  };
  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        resetValues();
        setIsOpen(false);
      }}
      maxWidth="sm"
      fullWidth
      aria-labelledby="tracking-dialog"
    >
      <DialogTitle>Add New Role</DialogTitle>
      <DialogContent tw="min-height[220px]">
        <form onSubmit={handleSubmit(onSubmit)} tw="flex flex-col space-y-5 pt-5">
          <FormHelperText>{errors.name ? errors.name.message : null}</FormHelperText>
          <FormControl fullWidth error={!!errors.name}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Select {...field} fullWidth size="small" error={!!errors.name}>
                  <MenuItem key="noneselected" value="none">
                    Please select a role
                  </MenuItem>
                  {localRoles.map((role) => {
                    return (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    );
                  })}
                </Select>
              )}
            />
          </FormControl>
          <div>
            <Button variant="contained" color="secondary" type="submit" data-testid="testIdButton">
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const GridToolbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add Role
      </Button>
      <AddRoleDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </GridToolbarContainer>
  );
};

export const Roles = () => {
  const roleQuery = useRoles();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate: del } = useDeleteRole();

  const deleteCellAction = (params: GridRowParams) => {
    const disabled = params?.row?._count?.user > 0 || params?.row?.name === 'norole';

    return [
      // eslint-disable-next-line react/jsx-key
      <GridActionsCellItem
        icon={<DeleteIcon />}
        label="Delete"
        disabled={disabled}
        onClick={() => {
          del(params.row.id, {
            onSuccess: () => {
              enqueueSnackbar('Role has been Deleted', { variant: 'success' });
            },
          });
        }}
      />,
    ];
  };

  const columns: GridColumns = useMemo(
    () => [
      { field: 'id', headerName: 'Id', flex: 1, editable: false },
      { field: 'name', headerName: 'Roles', flex: 1, editable: false },
      {
        field: 'actions',
        type: 'actions',
        width: 150,
        getActions: deleteCellAction,
      },
    ],
    []
  );

  if (roleQuery.isLoading) {
    return <div>...Loading</div>;
  }
  return (
    <div tw="h-[400px]">
      <DataGrid
        rows={roleQuery?.data}
        columns={columns}
        components={{
          Toolbar: GridToolbar,
        }}
        disableVirtualization
      />
    </div>
  );
};
