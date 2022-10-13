import { MemberTrackingRecord, TrackingItem } from '.prisma/client';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useMutation, useQueryClient } from 'react-query';
import { EMtrVariant, EMtrVerb, EUri } from '../../const/enums';
import { mtiQueryKeys } from './memberTrackingItem';

const MEMBER_TRACKING_RECORD_RESOURCE = 'membertrackingrecords';

export const mtrQueryKeys = {
  memberTrackingRecords: () => [MEMBER_TRACKING_RECORD_RESOURCE],
  memberTrackingRecord: (memberTrackingRecordId: number) => [MEMBER_TRACKING_RECORD_RESOURCE, memberTrackingRecordId],
};

export const useUpdateMemberTrackingRecord = (verb: EMtrVerb) => {
  const queryClient = useQueryClient();

  return useMutation<
    MemberTrackingRecord,
    unknown,
    { memberTrackingRecord: MemberTrackingRecord & { trackingItem: TrackingItem }; userId: number }
  >(
    ({ memberTrackingRecord }) =>
      axios
        .post(`/api/${MEMBER_TRACKING_RECORD_RESOURCE}/${memberTrackingRecord.id}/${verb}`, {
          completedDate: memberTrackingRecord.completedDate,
        })
        .then((response) => response.data),
    {
      onSettled: async (_data, _err, { userId }) => {
        queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItems(userId, EMtrVariant.IN_PROGRESS));
      },
    }
  );
};

export const useCreateMemberTrackingRecord = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (memberTrackingRecord: Partial<MemberTrackingRecord>) =>
      axios.post(`/api/${MEMBER_TRACKING_RECORD_RESOURCE}`, memberTrackingRecord).then((response) => response.data),
    {
      onSettled: (data: MemberTrackingRecord) => {
        queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItems(data.traineeId, EMtrVariant.ALL));
        queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItems(data.traineeId, EMtrVariant.COMPLETED));
        queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItems(data.traineeId, EMtrVariant.IN_PROGRESS));
      },
    }
  );
};

export const useDeleteMemberTrackingRecord = () => {
  const snackbar = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation<MemberTrackingRecord, unknown, { memberTrackingRecordId: number; userId: number }>(
    ({ memberTrackingRecordId }) =>
      axios.delete(EUri.MEMBER_TRACKING_RECORDS + memberTrackingRecordId).then((response) => response.data),
    {
      onSuccess: () => {
        snackbar.enqueueSnackbar('Record Deleted!', { variant: 'success' });
      },
      onError: () => {
        snackbar.enqueueSnackbar('Error deleting record', { variant: 'error' });
      },
      onSettled: async (_data, _err, { userId }) => {
        queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItems(userId, EMtrVariant.IN_PROGRESS));
        queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItems(userId, EMtrVariant.ALL));
        queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItems(userId, EMtrVariant.COMPLETED));
      },
    }
  );
};
