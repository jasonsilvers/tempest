import { Job, JobStatus } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { EUri } from '../../const/enums';
import { JobWithResults } from '../../repositories/jobRepo';
import { BulkTrackingBodyItem } from '../../utils/bulk';

export const queryKeys = {
  jobs: () => ['jobs'],
  job: (id: number) => ['job', id],
};

export const useAssignManyTrackingItemsToManyUsers = () => {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  return useMutation<AxiosResponse<Job>, unknown, BulkTrackingBodyItem[]>(
    (bulkTrackingBody: BulkTrackingBodyItem[]) => axios.post<Job>(EUri.BULK_CREATE, bulkTrackingBody),
    {
      onSuccess: () => {
        snackbar.enqueueSnackbar('Job queued', { variant: 'success' });
      },
      onSettled: (response) => {
        queryClient.invalidateQueries(queryKeys.job(response.data.id));
      },
      onError: () => {
        snackbar.enqueueSnackbar('Error assigning tracking items to users. Please try again!', { variant: 'error' });
      },
    }
  );
};

export const useJob = (jobId: number) => {
  const snackbar = useSnackbar();

  return useQuery<JobWithResults>(
    queryKeys.job(jobId),
    () => axios.get<JobWithResults>(EUri.JOBS + jobId).then((result) => result.data),
    {
      enabled: !!jobId,
      refetchInterval: (data) => {
        if (data?.status === JobStatus.COMPLETED || data?.status === JobStatus.FAILED) {
          return false;
        }

        return 1000;
      },

      onError: () => {
        snackbar.enqueueSnackbar('Error assigning tracking items to users. Please try again!', { variant: 'error' });
      },
    }
  );
};
