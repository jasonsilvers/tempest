import { NewGrant, useAddGrant, useDeleteGrant, useGrants, useUpdateGrant } from '../../hooks/api/grants';
import { DataGrid, GridActionsCellItem, GridColumns, GridRowModel, GridToolbarContainer } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';
import { Grant } from '@prisma/client';
import 'twin.macro';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { AddIcon, DeleteIcon } from '../../assets/Icons';
import Joi from 'joi';
import { Controller, useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { EAction, EResource, ERole } from '../../const/enums';
import { useSnackbar } from 'notistack';

const grantFormSchema = Joi.object({
  action: Joi.string()
    .required()
    .invalid(...['none']),
  attributes: Joi.string().required(),
  resource: Joi.string()
    .required()
    .invalid(...['none']),
  role: Joi.string()
    .required()
    .invalid(...['none']),
});

const actions = Object.values(EAction);
const resources = Object.values(EResource);
const roles = Object.values(ERole);

const AddGrantDialog = ({ isOpen, setIsOpen }) => {
  const { mutate: createGrant } = useAddGrant();
  const snackbar = useSnackbar();

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(grantFormSchema),
    defaultValues: {
      action: 'none',
      resource: 'none',
      role: 'none',
      attributes: '',
    },
  });

  const resetValues = () => {
    reset({ action: 'none', resource: 'none', role: 'none', attributes: '' });
  };

  const onSubmit = (data: NewGrant) => {
    createGrant(data, {
      onSuccess: () => {
        snackbar.enqueueSnackbar('Grant Added!', { variant: 'success' });
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
      <DialogTitle>Create New Grant</DialogTitle>
      <DialogContent tw="min-height[220px]">
        <form onSubmit={handleSubmit(onSubmit)} tw="flex flex-col space-y-5 pt-5">
          <FormControl fullWidth error={!!errors.action}>
            <Controller
              name="action"
              control={control}
              render={({ field }) => (
                <Select {...field} fullWidth size="small" error={!!errors.action}>
                  <MenuItem key="noneselected" value="none">
                    Please select an action
                  </MenuItem>
                  {actions.map((action) => {
                    return (
                      <MenuItem key={action} value={action}>
                        {action}
                      </MenuItem>
                    );
                  })}
                </Select>
              )}
            />

            <FormHelperText>{errors.action ? errors.action.message : null}</FormHelperText>
          </FormControl>

          <FormControl fullWidth error={!!errors.resource}>
            <Controller
              name="resource"
              control={control}
              render={({ field }) => (
                <Select {...field} fullWidth size="small" error={!!errors.resource}>
                  <MenuItem key="noneselected" value="none">
                    Please select a resource
                  </MenuItem>
                  {resources.map((resource) => {
                    return (
                      <MenuItem key={resource} value={resource}>
                        {resource}
                      </MenuItem>
                    );
                  })}
                </Select>
              )}
            />

            <FormHelperText>{errors.resource ? errors.resource.message : null}</FormHelperText>
          </FormControl>
          <FormControl fullWidth error={!!errors.role}>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select {...field} fullWidth size="small" error={!!errors.role}>
                  <MenuItem key="noneselected" value="none">
                    Please select a role
                  </MenuItem>
                  {roles.map((role) => {
                    return (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    );
                  })}
                </Select>
              )}
            />

            <FormHelperText>{errors.role ? errors.role.message : null}</FormHelperText>
          </FormControl>
          <FormControl fullWidth error={!!errors.attributes}>
            <TextField
              required
              label="attributes"
              error={!!errors.attributes}
              fullWidth
              inputProps={{ ...register('attributes'), 'aria-label': 'attributes' }}
            />
            <FormHelperText>{errors.attributes ? errors.attributes.message : null}</FormHelperText>
          </FormControl>
          <div>
            <Button variant="contained" color="secondary" type="submit">
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

function GridToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
      <AddGrantDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </GridToolbarContainer>
  );
}

export const Grants = () => {
  const { enqueueSnackbar } = useSnackbar();
  const grantsQuery = useGrants();
  const mutateGrant = useUpdateGrant();
  const { mutate: del } = useDeleteGrant();

  const columns: GridColumns = useMemo(
    () => [
      { field: 'action', headerName: 'action', flex: 1, editable: true },
      { field: 'attributes', headerName: 'attributes', flex: 1, editable: true },
      { field: 'resource', headerName: 'resource', flex: 1, editable: true },
      { field: 'role', headerName: 'Role', flex: 1, editable: true },
      {
        field: 'actions',
        type: 'actions',
        width: 150,
        getActions: ({ id }: { id: number }) => {
          return [
            // eslint-disable-next-line react/jsx-key
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() =>
                del(id, {
                  onSuccess: () => {
                    enqueueSnackbar('Tracking Item Deleted', { variant: 'success' });
                  },
                })
              }
            />,
          ];
        },
      },
    ],
    []
  );

  const processRowUpdate = useCallback((newRow: GridRowModel<Grant>, oldRow: GridRowModel<Grant>) => {
    if (
      oldRow.attributes !== newRow.attributes ||
      oldRow.action !== newRow.action ||
      oldRow.resource !== newRow.resource ||
      oldRow.role !== newRow.role
    ) {
      mutateGrant.mutate(newRow);

      return newRow;
    }

    return oldRow;
  }, []);

  if (grantsQuery.isLoading) {
    return <div>...loading</div>;
  }

  return (
    <div tw="h-[720px]">
      <DataGrid
        rows={grantsQuery.data}
        columns={columns}
        processRowUpdate={processRowUpdate}
        experimentalFeatures={{ newEditingApi: true }}
        disableVirtualization
        components={{
          Toolbar: GridToolbar,
        }}
      />
    </div>
  );
};
