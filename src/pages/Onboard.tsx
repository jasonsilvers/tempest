import { joiResolver } from '@hookform/resolvers/joi';
import { Box, Button, Dialog, DialogContent, DialogTitle, FormControl, TextField, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Organization } from '@prisma/client';
import Joi from 'joi';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import 'twin.macro';
import { useOnboardOrg } from '../hooks/api/onboard';
import { useUser } from '@tron/nextjs-auth-p1';

const formSchema = Joi.object({
  name: Joi.string().required(),
  shortName: Joi.string().required(),
});

const Onboard: FC = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(true);
  const { refreshUser } = useUser();
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

  const submitForm = (data) => {
    const createdOrg = {
      name: data.name,
      shortName: data.shortName,
    } as Organization;

    onboardOrg(createdOrg, {
      onSuccess: () => {
        enqueueSnackbar('Organization Created', { variant: 'success' });
        setDialogIsOpen(false);
        refreshUser();
        router.push('/Programadmin');
      },
    });
  };

  return (
    <>
      <Dialog open={dialogIsOpen} maxWidth="sm" fullScreen aria-labelledby="create-org-dialog">
        <div tw="absolute pt-7 pl-6">
          <IconButton
            size="small"
            tw="float-left relative"
            color="secondary"
            data-testid="backButton"
            onClick={() => {
              resetValues();
              setDialogIsOpen(false);
              router.push('/');
            }}
          >
            <ArrowBackIcon tw="pr-1" /> BACK
          </IconButton>
        </div>
        <Box tw="min-w-[500px] min-h-[275px] border shadow rounded-lg justify-center mx-auto my-auto">
          <DialogTitle tw="text-3xl text-secondary text-center pt-10">Create Your New Organization</DialogTitle>
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
                >
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Box>
      </Dialog>
    </>
  );
};
export default Onboard;
