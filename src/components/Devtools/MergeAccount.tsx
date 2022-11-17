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
import { useUser } from '@tron/nextjs-auth-p1';
import { useSnackbar } from 'notistack';
import React, { Dispatch, SetStateAction } from 'react';
import 'twin.macro';
import { MergeUsersBody, useMergeAccount } from '../../hooks/api/merge';
import { useUsers } from '../../hooks/api/users';

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
  const [options] = React.useState<string[]>(userList?.map((user) => user.email));

  const [formState, setFormState] = React.useState<MergeUsersBody>({ winningAccountEmail: '', losingAccountEmail: '' });

  const submitForm = () => {
    const mergeBody = {
      winningAccountEmail: formState.winningAccountEmail,
      losingAccountEmail: formState.losingAccountEmail,
    };

    mergeAccount(mergeBody, {
      onSuccess: () => {
        enqueueSnackbar('Accounts have successfully been merged', { variant: 'success' });
        refreshUser();
      },
    });
    setIsOpen(false);
    setFormState({winningAccountEmail: '', losingAccountEmail: ''})
  };

  return (
    <>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="sm" aria-labelledby="merge-account-dialog">
        <Box tw="min-w-[500px] min-h-[275px] border shadow rounded-lg justify-center mx-auto my-auto">
          <DialogTitle tw="text-3xl text-secondary text-center pt-10">Merge Accounts</DialogTitle>
          <DialogContent tw="min-height[220px]">
            <form id="merge-form" tw="flex flex-col space-y-5 pt-4 items-center">
              <Autocomplete
                id="winner-email"
                sx={{ width: 300 }}
                open={openWinner}
                onOpen={() => {
                  setOpenWinner(true);
                }}
                onClose={() => {
                  setOpenWinner(false);
                }}
                isOptionEqualToValue={(option, value) => option === value}
                getOptionLabel={(option) => option}
                options={options}
                loading={isLoading}
                renderInput={(params: AutocompleteRenderInputParams) => {
                  return (
                    <TextField
                      tw="w-full mx-auto"
                      {...params}
                      onBlur={(event) => {
                        event.preventDefault();
                        setFormState({ ...formState, winningAccountEmail: event.target.value });
                      }}
                      label="winnerAccount"
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
                id="loser-email"
                sx={{ width: 300 }}
                open={openLoser}
                onOpen={() => {
                  setOpenLoser(true);
                }}
                onClose={() => {
                  setOpenLoser(false);
                }}
                isOptionEqualToValue={(option, value) => option === value}
                getOptionLabel={(option) => option}
                options={options}
                loading={isLoading}
                renderInput={(params) => {
                  return (
                    <TextField
                      tw="w-full mx-auto"
                      {...params}
                      onBlur={(event) => {
                        event.preventDefault();
                        setFormState({ ...formState, losingAccountEmail: event.target.value });
                      }}
                      label="loserAccount"
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
