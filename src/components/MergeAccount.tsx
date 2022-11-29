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
import React, { Dispatch, SetStateAction } from 'react';
import { useQueryClient } from 'react-query';
import 'twin.macro';
import { MergeUsersBody, useMergeAccount } from '../hooks/api/merge';
import { usersQueryKeys, useUsers } from '../hooks/api/users';

type MergeAccountProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const MergeAccount: React.FC<MergeAccountProps> = ({ isOpen, setIsOpen }): JSX.Element => {
  const { isLoading, data: userList } = useUsers();
  const { refreshUser } = useUser();
  const queryClient = useQueryClient();
  const { mutate: mergeAccount } = useMergeAccount();
  const [formState, setFormState] = React.useState<MergeUsersBody>({ winningAccountId: 0, losingAccountId: 0 });

  const submitForm = () => {
    const mergeBody = {
      winningAccountId: formState.winningAccountId,
      losingAccountId: formState.losingAccountId,
    };

    mergeAccount(mergeBody, {
      onSettled: () => {
        queryClient.invalidateQueries(usersQueryKeys.users());
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
                data-testid="winner-account"
                aria-labelledby="winner-account"
                sx={{ width: 300 }}
                getOptionLabel={(option: User) => option.email}
                options={userList ?? []}
                loading={isLoading}
                onChange={(_event, value) => {
                  const user = value as unknown as User;

                  setFormState({ ...formState, winningAccountId: user ? user.id : 0 });
                }}
                renderInput={(params: AutocompleteRenderInputParams) => {
                  return (
                    <TextField
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
                data-testid="loser-account"
                aria-labelledby="loser-account"
                sx={{ width: 300 }}
                getOptionLabel={(option: User) => option.email}
                options={userList ?? []}
                loading={isLoading}
                onChange={(_event, value) => {
                  const user = value as unknown as User;
                  setFormState({ ...formState, losingAccountId: user ? user.id : 0 });
                }}
                renderInput={(params) => {
                  return (
                    <TextField
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
                  disabled={formState.losingAccountId === 0 || formState.winningAccountId === 0}
                >
                  Merge Accounts
                </Button>
              </div>
            </form>
          </DialogContent>
        </Box>
      </Dialog>
    </>
  );
};
