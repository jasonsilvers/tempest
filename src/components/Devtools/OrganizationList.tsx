import { useCreateOrg, useDeleteOrganization, useOrgs } from '../../hooks/api/organizations';
import { DataGrid, GridActionsCellItem, GridColumns } from '@mui/x-data-grid';

import 'twin.macro';
import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { AddIcon, Close, DeleteIcon } from '../../assets/Icons';
import { Organization } from '@prisma/client';
import {
  Button,
  Fab,
  FormControl,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle, LoadingOverlay } from '../../lib/ui';
import Joi from 'joi';
import { Controller, useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';

const organizationSchema = Joi.object({
  name: Joi.string().required(),
  shortName: Joi.string().required(),
  parentId: Joi.number().optional(),
});

const ShowLoadingOverlay = ({ showLoading }: { showLoading: boolean }) => {
  if (showLoading) {
    return <LoadingOverlay />;
  }

  return null;
};

export const OrganizationList = () => {
  const { data: orgs, isLoading } = useOrgs();
  const createOrg = useCreateOrg();
  const deleteOrg = useDeleteOrganization();
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    register,
    reset,

    handleSubmit,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: joiResolver(organizationSchema),
    defaultValues: {
      name: '',
      shortName: '',
      parentId: -1,
    },
  });

  const columns: GridColumns<Organization> = useMemo(
    () => [
      { field: 'id', headerName: 'Id', flex: 1 },
      { field: 'name', headerName: 'Name', flex: 1, editable: true },
      { field: 'shortName', headerName: 'Short Name', flex: 1, editable: true },
      {
        field: 'parentId',
        headerName: 'Parent',
        flex: 1,
        valueGetter: (params) => {
          return orgs?.find((org) => org.id === params.value)?.name;
        },
      },
      {
        field: 'actions',
        type: 'actions',
        width: 150,
        getActions: (params) => {
          const disabled = params.row._count.users > 0 || params.row._count.children > 0 ? true : false;

          return [
            // eslint-disable-next-line react/jsx-key
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              disabled={disabled}
              onClick={() => {
                deleteOrg.mutate(params.row.id, {
                  onSuccess: () => {
                    enqueueSnackbar('Organization Deleted', { variant: 'success' });
                  },
                  onError: (error: { response: { status: number; data: { message: string } } }) => {
                    if (error.response.status === 409) {
                      enqueueSnackbar(error.response.data.message, { variant: 'error' });
                    }
                  },
                });
              }}
            />,
          ];
        },
      },
    ],
    []
  );

  const onSubmit = (data) => {
    const newOrg = {
      name: data.name,
      shortName: data.shortName,
      parentId: data.parentId === -1 ? null : data.parentId,
    };

    createOrg.mutate(newOrg as Organization, {
      onSuccess: () => {
        enqueueSnackbar('Added Organization', { variant: 'success' });
        setDialogIsOpen(false);
        setIsSavingOrg(false);
        reset();
      },
    });
  };

  if (isLoading) {
    return <div>...Loading</div>;
  }

  return (
    <div>
      <div tw="h-[500px] pb-10">
        <DataGrid rows={orgs} columns={columns} experimentalFeatures={{ newEditingApi: true }} />
      </div>
      <div tw="flex justify-center">
        <Fab color="secondary" onClick={() => setDialogIsOpen(true)}>
          <AddIcon />
        </Fab>
      </div>
      <Dialog open={dialogIsOpen} maxWidth="sm" fullWidth aria-labelledby="tracking-dialog">
        <ShowLoadingOverlay showLoading={isSavingOrg} />
        <DialogActions>
          <IconButton
            onClick={() => [setDialogIsOpen(false), reset()]}
            aria-label="dialog-close-button"
            color="secondary"
            tw="absolute float-right top-2"
          >
            <Close />
          </IconButton>
        </DialogActions>
        <DialogTitle>Create New Organization</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent tw="min-height[220px]">
            <div tw="flex flex-col space-y-10">
              <FormControl fullWidth error={!!errors.name}>
                <Typography sx={{ color: errors.name || !dirtyFields.name ? '#d3302f' : 'black' }}>* Name</Typography>
                <TextField
                  error={!!errors.name}
                  fullWidth
                  size="small"
                  inputProps={{ ...register('name'), 'aria-label': 'name' }}
                />
                <FormHelperText>{errors.name ? errors.name.message : null}</FormHelperText>
              </FormControl>
              <FormControl fullWidth error={!!errors.shortName}>
                <Typography sx={{ color: errors.shortName || !dirtyFields.shortName ? '#d3302f' : 'black' }}>
                  * Short Name
                </Typography>
                <TextField
                  error={!!errors.shortName}
                  fullWidth
                  size="small"
                  inputProps={{ ...register('shortName'), 'aria-label': 'shortName' }}
                />
                <FormHelperText>{errors.shortName ? errors.shortName.message : null}</FormHelperText>
              </FormControl>
              <FormControl fullWidth error={!!errors.parentId}>
                <Typography sx={{ color: errors.parentId ? '#d3302f' : 'black' }}>Parent Organization</Typography>
                <Controller
                  name="parentId"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} fullWidth size="small" error={!!errors.parentId}>
                      <MenuItem key="noneselected" value="-1">
                        None
                      </MenuItem>
                      {orgs?.map((org) => {
                        return (
                          <MenuItem key={org.id} value={org.id}>
                            {org.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  )}
                />

                <FormHelperText>{errors.parentId ? errors.parentId.message : null}</FormHelperText>
              </FormControl>
            </div>
          </DialogContent>

          <DialogActions>
            <Button
              type="submit"
              // onClick={}

              size="medium"
              color="secondary"
              variant="contained"
            >
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};
