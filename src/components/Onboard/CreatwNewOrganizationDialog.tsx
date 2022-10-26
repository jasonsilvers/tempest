import { joiResolver } from '@hookform/resolvers/joi';
import { Button, Dialog, DialogContent, DialogTitle, FormControl, TextField } from '@mui/material';
import { Organization } from '@prisma/client';
import Joi from 'joi';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import 'twin.macro';
import { useOnboardOrg } from '../../hooks/api/onboard';

const formSchema = Joi.object({
  name: Joi.string().required(),
  shortName: Joi.string().required(),
});

type CreateNewOrganizationDialogProps = {
  dialogIsOpen: boolean;
  setDialogIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const CreateNewOrganizationDialog: React.FC<CreateNewOrganizationDialogProps> = ({
  dialogIsOpen,
  setDialogIsOpen,
}) => {
  const { mutate: onboardOrg } = useOnboardOrg();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: joiResolver(formSchema),
    defaultValues: {
      name: '',
      shortName: '',
    },
  });

  const resetValues = () => {
    reset({ name: '', shortName: '' });
  };
  const createDisabled = Object.keys(dirtyFields).length === 0;

  const submitForm = (data: Organization) => {
    const createdOrg = {
      name: data.name,
      shortName: data.shortName,
    } as Organization;

    onboardOrg(createdOrg, {
      onSuccess: () => {
        enqueueSnackbar('Organization Created', { variant: 'success' });
        setDialogIsOpen(false);
      },
    });
  };

  return (
    <Dialog
      open={dialogIsOpen}
      onClose={() => {
        resetValues();
        setDialogIsOpen(false);
      }}
      maxWidth="sm"
      fullWidth
      aria-labelledby="create-org-dialog"
    >
      <DialogTitle tw="text-secondary text-center">Create Your New Organization</DialogTitle>
      <DialogContent tw="min-height[220px]">
        <form id="create-form" onSubmit={handleSubmit(submitForm)} tw="flex flex-col space-y-5 pt-4 items-center">
          <FormControl fullWidth error={!!errors.name}>
            <TextField
              tw="w-2/3 mx-auto"
              error={!!errors.name}
              size="small"
              label="Organization Name"
              inputProps={{ ...register('name'), 'aria-label': 'org-name' }}
            />
          </FormControl>
          <FormControl fullWidth error={!!errors.shortName}>
            <TextField
              tw="w-2/3 mx-auto"
              error={!!errors.shortName}
              size="small"
              label="Short Name"
              inputProps={{ ...register('shortName'), 'aria-label': 'org-shortName' }}
            />
          </FormControl>

          <div tw="flex-col">
            <Button
              variant="contained"
              color="secondary"
              type="submit"
              form="create-form"
              data-testid="createButton"
              disabled={createDisabled}
              onClick={() => router.push('/Admin')}
            >
              Create
            </Button>
            <Button
              tw="mt-auto"
              variant="text"
              color="secondary"
              data-testid="cancal_Button"
              onClick={() => {
                resetValues();
                setDialogIsOpen(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
