import { Button, Dialog, DialogContent, DialogTitle, FormControl, FormHelperText, TextField } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColumns, GridToolbarContainer } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useMemo, useState } from 'react';
import 'twin.macro';
import { NewResource, useCreateResource, useDeleteResource, useResources } from '../../hooks/api/resources';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { useForm } from 'react-hook-form';
import { AddIcon, DeleteIcon } from '../../assets/Icons';

const resourceFormSchema = Joi.object({
  name: Joi.string().required(),
});

const AddResourceDialog = ({ isOpen, setIsOpen }) => {
  const { mutate: createResource } = useCreateResource();
  const snackbar = useSnackbar();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(resourceFormSchema),
    defaultValues: {
      name: '',
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
            <TextField
              required
              label="resource"
              error={!!errors.name}
              fullWidth
              inputProps={{ ...register('name'), 'aria-label': 'name' }}
            />
            <FormHelperText>{errors.name ? errors.name.message : null}</FormHelperText>
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

  const columns: GridColumns = useMemo(
    () => [
      { field: 'id', headerName: 'Id', flex: 1, editable: true },
      { field: 'name', headerName: 'Name', flex: 1, editable: true },
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
              onClick={() => {
                del(id, {
                  onSuccess: () => {
                    enqueueSnackbar('Resource Deleted', { variant: 'success' });
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

  if (resourceQuery.isLoading) {
    return <div>...loading</div>;
  }

  return (
    <div tw="h-[560px]">
      <DataGrid
        rows={resourceQuery.data}
        columns={columns}
        experimentalFeatures={{ newEditingApi: true }}
        disableVirtualization
        components={{
          Toolbar: GridToolbar,
        }}
      />
    </div>
  );
};
