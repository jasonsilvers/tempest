import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { useMutation, useQueryClient } from 'react-query';
import { EUri, ITempestApiMessage } from '../../const/enums';
import { usersQueryKeys } from './users';

export type MergeUsersBody = {
  winningAccountId: number;
  losingAccountId: number;
};

export const useMergeAccount = () => {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();

  return useMutation<AxiosResponse<MergeUsersBody>, unknown, MergeUsersBody>(
    (mergeUsersBody: MergeUsersBody) => axios.post(EUri.MERGE, mergeUsersBody),
    {
      onError: (error: AxiosError<ITempestApiMessage>) => {
        snackbar.enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
      onSettled: () => {
        queryClient.invalidateQueries(usersQueryKeys.users());
      },
    }
  );
};
