import { joiResolver } from '@hookform/resolvers/joi';
import Close from '@mui/icons-material/Close';
import {
  Dialog,
  DialogActions,
  IconButton,
  DialogTitle,
  DialogContent,
  FormControl,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  FormHelperText,
} from '@mui/material';
import { Organization } from '@prisma/client';
import Joi from 'joi';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useState } from 'react';
import { useForm, Controller, FieldError } from 'react-hook-form';
import { useCreateOrg } from '../../hooks/api/organizations';
import { LoadingOverlay } from '../../lib/ui';
import 'twin.macro';
import { LoggedInUser } from '../../repositories/userRepo';

type FormErrors = {
  name?: FieldError;
  shortName?: FieldError;
  parentId?: FieldError;
};

type DirtyFormFields = {
  name?: boolean;
  shortName?: boolean;
  parentId?: boolean;
};

type InputVariant = 'name' | 'shortName' | 'parentId';

type OrgFormData = {
  name: string;
  shortName: string;
  parentId: number;
};

const determineInputLabelColor = (errors: FormErrors, dirtyFields: DirtyFormFields, variant: InputVariant) => {
  return errors[variant] || !dirtyFields[variant] ? '#d3302f' : 'black';
};

const InputHelperText = ({ errors, variant }: { errors: FormErrors; variant: InputVariant }) => {
  return <FormHelperText>{errors[variant] ? errors[variant].message : null}</FormHelperText>;
};

const organizationSchema = Joi.object({
  name: Joi.string().required(),
  shortName: Joi.string().required(),
  parentId: Joi.number().required(),
});

const ShowLoadingOverlay = ({ showLoading }: { showLoading: boolean }) => {
  if (showLoading) {
    return <LoadingOverlay />;
  }

  return null;
};

type AddNewOrganizationDialogProps = {
  dialogIsOpen: boolean;
  setDialogIsOpen: Dispatch<SetStateAction<boolean>>;
  orgs: Organization[];
  loggedInUser: LoggedInUser;
};

export const AddNewOrganizationDialog: React.FC<AddNewOrganizationDialogProps> = ({
  dialogIsOpen,
  setDialogIsOpen,
  orgs,
  loggedInUser,
}) => {
  const createOrg = useCreateOrg();
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
      parentId: loggedInUser.organizationId,
    },
  });

  const onSubmit = (data: OrgFormData) => {
    const newOrg = {
      name: data.name,
      shortName: data.shortName,
      parentId: data.parentId,
    };

    setIsSavingOrg(true);

    createOrg.mutate(newOrg as Organization, {
      onSuccess: () => {
        enqueueSnackbar('Added Organization', { variant: 'success' });
        setDialogIsOpen(false);
        setIsSavingOrg(false);
        reset();
      },
    });
  };

  return (
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
              <Typography sx={{ color: determineInputLabelColor(errors, dirtyFields, 'name') }}>* Name</Typography>
              <TextField
                error={!!errors.name}
                fullWidth
                size="small"
                inputProps={{ ...register('name'), 'aria-label': 'name-input' }}
              />
              <InputHelperText errors={errors} variant="name" />
            </FormControl>
            <FormControl fullWidth error={!!errors.shortName}>
              <Typography sx={{ color: determineInputLabelColor(errors, dirtyFields, 'shortName') }}>
                * Short Name
              </Typography>
              <TextField
                error={!!errors.shortName}
                fullWidth
                size="small"
                inputProps={{ ...register('shortName'), 'aria-label': 'shortName' }}
              />
              <InputHelperText errors={errors} variant="shortName" />
            </FormControl>
            <FormControl fullWidth error={!!errors.parentId}>
              <Typography>Parent Organization</Typography>
              <Controller
                name="parentId"
                control={control}
                render={({ field }) => (
                  <Select {...field} fullWidth size="small" error={!!errors.parentId}>
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

              <InputHelperText errors={errors} variant="parentId" />
            </FormControl>
          </div>
        </DialogContent>

        <DialogActions>
          <Button type="submit" size="medium" color="secondary" variant="contained" disabled={orgs === null}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
