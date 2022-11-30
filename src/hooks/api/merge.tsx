import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { useMutation } from 'react-query';
import { EUri, ITempestApiMessage } from '../../const/enums';

export type MergeUsersBody = {
  winningAccountId: number;
  losingAccountId: number;
};

export const useMergeAccount = () => {
  const snackbar = useSnackbar();

  return useMutation<AxiosResponse<MergeUsersBody>, unknown, MergeUsersBody>(
    (mergeUsersBody: MergeUsersBody) => axios.post(EUri.MERGE, mergeUsersBody),
    {
      onSuccess: () => {
        snackbar.enqueueSnackbar('Accounts have successfully been merged', { variant: 'success' });
      },
      onError: (error: AxiosError<ITempestApiMessage>) => {
        snackbar.enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    }
  );
};
