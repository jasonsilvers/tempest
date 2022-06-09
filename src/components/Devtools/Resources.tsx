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
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import 'twin.macro';
import { AddIcon, DeleteIcon } from '../../assets/Icons';
import { EResource } from '../../const/enums';
import { NewResource, useCreateResource, useDeleteResource, useResources } from '../../hooks/api/resources';

const resourceFormSchema = Joi.object({
  name: Joi.string()
    .required()
    .invalid(...['none']),
});

const resources = Object.values(EResource);

const AddResourceDialog = ({ isOpen, setIsOpen }) => {
  const { mutate: createResource } = useCreateResource();
  const snackbar = useSnackbar();

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(resourceFormSchema),
    defaultValues: {
      name: 'none',
    },
  });

  const resetValues = () => {
    reset({ name: '' });
  };

  const onSubmit = (data: NewResource) => {
    createResource(data, {
      onSuccess: () => {
        snackbar.enqueueSnackbar('Resource Added!', { variant: 'success' });
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
      <DialogTitle>Create New Resource</DialogTitle>
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
        Add Resource
      </Button>
      <AddResourceDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </GridToolbarContainer>
  );
};

export const Resources = () => {
  const resourceQuery = useResources();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate: del } = useDeleteResource();

  const deleteCellAction = (params: GridRowParams) => {
    const disabled = params.row?._count?.grant > 0;

    return [
      // eslint-disable-next-line react/jsx-key
      <GridActionsCellItem
        icon={<DeleteIcon />}
        label="Delete"
        disabled={disabled}
        onClick={() => {
          del(params.row.id, {
            onSuccess: () => {
              enqueueSnackbar('Organization Deleted', { variant: 'success' });
            },
          });
        }}
      />,
    ];
  };

  const columns: GridColumns = useMemo(
    () => [
      { field: 'id', headerName: 'Id', flex: 1, editable: true },
      { field: 'name', headerName: 'Name', flex: 1, editable: true },
      {
        field: 'actions',
        type: 'actions',
        width: 150,
        getActions: deleteCellAction,
      },
    ],
    []
  );

  if (resourceQuery.isLoading) {
    return <div>...loading</div>;
  }

  return (
    <div tw="h-[560px]">
      <DataGrid
        rows={resourceQuery.data}
        columns={columns}
        disableVirtualization
        components={{
          Toolbar: GridToolbar,
        }}
        disableSelectionOnClick={true}
      />
    </div>
  );
};
