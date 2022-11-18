import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { User } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import { useSnackbar } from 'notistack';
import React, { Dispatch, SetStateAction } from 'react';
import 'twin.macro';
import { MergeUsersBody, useMergeAccount } from '../hooks/api/merge';
import { useUsers } from '../hooks/api/users';

type MergeAccountProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const MergeAccount: React.FC<MergeAccountProps> = ({ isOpen, setIsOpen }): JSX.Element => {
  const { isLoading, data: userList } = useUsers();
  const { refreshUser } = useUser();
  const { mutate: mergeAccount } = useMergeAccount();
  const { enqueueSnackbar } = useSnackbar();
  const [openWinner, setOpenWinner] = React.useState(false);
  const [openLoser, setOpenLoser] = React.useState(false);

  const [formState, setFormState] = React.useState<MergeUsersBody>({ winningAccountId: 0, losingAccountId: 0 });

  const submitForm = () => {
    const mergeBody = {
      winningAccountId: formState.winningAccountId,
      losingAccountId: formState.losingAccountId,
    };

    mergeAccount(mergeBody, {
      onSuccess: () => {
        enqueueSnackbar('Accounts have successfully been merged', { variant: 'success' });
        refreshUser();
      },
    });
    setIsOpen(false);
    setFormState({ winningAccountId: 0, losingAccountId: 0 });
  };

  return (
    <>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="sm" aria-labelledby="merge-account-dialog">
        <Box tw="min-w-[500px] min-h-[275px] border shadow rounded-lg justify-center mx-auto my-auto">
          <DialogTitle tw="text-3xl text-secondary text-center pt-10">Merge Accounts</DialogTitle>
          <DialogContent tw="min-height[220px]">
            <form id="merge-form" tw="flex flex-col space-y-5 pt-4 items-center">
              <Autocomplete
                id="winnerAccount"
                sx={{ width: 300 }}
                open={openWinner}
                onOpen={() => {
                  setOpenWinner(true);
                }}
                onClose={() => {
                  setOpenWinner(false);
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option: User) => option.email}
                options={userList ?? []}
                loading={isLoading}
                onChange={(_event, user: User) => {
                  const userId = user.id;
                  setFormState({ ...formState, winningAccountId: userId });
                }}
                renderInput={(params: AutocompleteRenderInputParams) => {
                  return (
                    <TextField
                      data-testid="winner-account"
                      tw="w-full mx-auto"
                      {...params}
                      label="Winner Account"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  );
                }}
              />

              <Autocomplete
                id="loserAccount"
                sx={{ width: 300 }}
                open={openLoser}
                onOpen={() => {
                  setOpenLoser(true);
                }}
                onClose={() => {
                  setOpenLoser(false);
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option: User) => option.email}
                options={userList ?? []}
                loading={isLoading}
                onChange={(_event, user: User) => {
                  const userId = user.id;
                  setFormState({ ...formState, losingAccountId: userId });
                }}
                renderInput={(params) => {
                  return (
                    <TextField
                      data-testid="loser-account"
                      tw="w-full mx-auto"
                      {...params}
                      label="Loser Account"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  );
                }}
              />

              <div tw="flex-col">
                <Button
                  variant="contained"
                  color="secondary"
                  type="button"
                  onClick={submitForm}
                  form="merge-form"
                  data-testid="mergeButton"
                >
                  Merge
                </Button>
              </div>
            </form>
          </DialogContent>
        </Box>
      </Dialog>
    </>
  );
};
