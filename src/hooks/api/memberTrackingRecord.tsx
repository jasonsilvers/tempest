import { MemberTrackingRecord } from '.prisma/client';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { RecordWithTrackingItem } from '../../components/Records/RecordRow';
import { MemberTrackingRecordWithUsers } from '../../repositories/memberTrackingRepo';
import { EMtrVerb } from '../../types/global';
import { getCategory } from '../../utils/Status';
import { mtiQueryKeys } from './memberTrackingItem';

const MEMBER_TRACKING_RECORD_RESOURCE = 'membertrackingrecords';

export const mtrQueryKeys = {
  memberTrackingRecord: (memberTrackingRecordId: number) => [MEMBER_TRACKING_RECORD_RESOURCE, memberTrackingRecordId],
};

export const useMemberTrackingRecord = (memberTrackingRecordId: number) => {
  return useQuery<MemberTrackingRecordWithUsers>(
    mtrQueryKeys.memberTrackingRecord(memberTrackingRecordId),
    () =>
      axios.get(`/api/${MEMBER_TRACKING_RECORD_RESOURCE}/${memberTrackingRecordId}`).then((response) => response.data),
    {
      enabled: !!memberTrackingRecordId,
      // placeholderData: {
      //   id: null,
      //   completedDate: null,
      //   authorityId: null,
      //   authoritySignedDate: null,
      //   order: null,
      //   trackingItemId: null,
      //   traineeId: null,
      //   traineeSignedDate: null,
      // },
    }
  );
};
export const useUpdateMemberTrackingRecord = (verb: EMtrVerb) => {
  const queryClient = useQueryClient();

  return useMutation<MemberTrackingRecord, unknown, { memberTrackingRecord: RecordWithTrackingItem; userId: string }>(
    ({ memberTrackingRecord }) =>
      axios
        .post(`/api/${MEMBER_TRACKING_RECORD_RESOURCE}/${memberTrackingRecord.id}/${verb}`, memberTrackingRecord)
        .then((response) => response.data),
    {
      onMutate: async ({ memberTrackingRecord }) => {
        await queryClient.cancelQueries(mtrQueryKeys.memberTrackingRecord(memberTrackingRecord.id));
        const previousState = queryClient.getQueryData(mtrQueryKeys.memberTrackingRecord(memberTrackingRecord.id));

        const status = getCategory(memberTrackingRecord, memberTrackingRecord.trackingItem.interval);

        queryClient.setQueryData(
          mtrQueryKeys.memberTrackingRecord(memberTrackingRecord.id),
          (old: RecordWithTrackingItem) => ({
            ...old,
            ...memberTrackingRecord,
            authoritySignedDate: null,
            traineeSignedDate: null,
            status,
          })
        );
        return previousState;
      },

      onSettled: (data) => {
        //This will need to be updated when signing for authority
        queryClient.invalidateQueries(mtrQueryKeys.memberTrackingRecord(data.id));
      },
      onError: (err, { memberTrackingRecord }, previousState) => {
        queryClient.setQueryData(mtrQueryKeys.memberTrackingRecord(memberTrackingRecord.id), previousState);
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
      onSuccess: (data: MemberTrackingRecord) => {
        queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItem(data.traineeId, data.trackingItemId));
      },
    }
  );
};
