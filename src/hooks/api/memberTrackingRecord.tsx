import { MemberTrackingRecord } from '.prisma/client';
import { User } from '@prisma/client';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { RecordWithTrackingItem } from '../../components/Records/MemberRecordTracker/RecordRow';
import { MemberTrackingRecordWithUsers } from '../../repositories/memberTrackingRepo';
import { EMtrVerb, EUri } from '../../types/global';
import { getCategory } from '../../utils/Status';
import { mtiQueryKeys } from './memberTrackingItem';

const MEMBER_TRACKING_RECORD_RESOURCE = 'membertrackingrecords';

export const mtrQueryKeys = {
  memberTrackingRecords: (memberTrackingRecordId: number) => [MEMBER_TRACKING_RECORD_RESOURCE, memberTrackingRecordId],
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
        .post(`/api/${MEMBER_TRACKING_RECORD_RESOURCE}/${memberTrackingRecord.id}/${verb}`, {
          completedDate: memberTrackingRecord.completedDate,
        })
        .then((response) => response.data),
    {
      onMutate: async ({ memberTrackingRecord }) => {
        await queryClient.cancelQueries(mtrQueryKeys.memberTrackingRecord(memberTrackingRecord.id));
        const previousState = queryClient.getQueryData(mtrQueryKeys.memberTrackingRecord(memberTrackingRecord.id));
        const loggedInUser: User = queryClient.getQueryData('loggedInUser');

        const status = getCategory(memberTrackingRecord, memberTrackingRecord.trackingItem.interval);
        // optimistic update for the completedDate
        if (verb === EMtrVerb.UPDATE_COMPLETION) {
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
        }
        // optimistic update for the traineeSignedDate
        if (verb === EMtrVerb.SIGN_TRAINEE) {
          queryClient.setQueryData(
            mtrQueryKeys.memberTrackingRecord(memberTrackingRecord.id),
            (old: RecordWithTrackingItem) => ({
              ...old,
              ...memberTrackingRecord,
              traineeSignedDate: new Date(),
              status,
            })
          );
        }
        // optimistic update for the authoritySignedDate
        if (verb === EMtrVerb.SIGN_AUTHORITY) {
          queryClient.setQueryData(
            mtrQueryKeys.memberTrackingRecord(memberTrackingRecord.id),
            (old: RecordWithTrackingItem) => ({
              ...old,
              ...memberTrackingRecord,
              authoritySignedDate: new Date(),
              authority: loggedInUser,
              status,
            })
          );
        }

        // fallback to the previous state
        return previousState;
      },

      onSettled: async (data) => {
        //This will need to be updated when signing for authority

        queryClient.invalidateQueries(mtrQueryKeys.memberTrackingRecord(data.id));
      },
      onError: async (err, { memberTrackingRecord }, previousState) => {
        queryClient.setQueryData(mtrQueryKeys.memberTrackingRecord(memberTrackingRecord.id), previousState);
        queryClient.cancelMutations();
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

export const useDeleteMemberTrackingRecord = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (memberTrackingRecordId: number) =>
      axios.delete(EUri.MEMBER_TRACKING_RECORDS + memberTrackingRecordId).then((response) => response.data),
    {
      onSettled: (data: MemberTrackingRecord) => {
        queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItems(data.traineeId));
      },
    }
  );
};
