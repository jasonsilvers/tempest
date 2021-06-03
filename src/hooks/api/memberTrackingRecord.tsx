import { MemberTrackingRecord } from '.prisma/client';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { RecordWithTrackingItem } from '../../components/Records/RecordRow';
import { getCategory } from '../../utils/Status';
import { useMemberRecordTrackerState } from '../uiState';
import { mtiQueryKeys } from './memberTrackingItem';

type Verb = 'sign_trainee' | 'sign_authority';

const MEMBER_TRACKING_RECORD_RESOURCE = 'membertrackingrecords';

export const mtrQueryKeys = {
  memberTrackingRecord: (memberTrackingRecordId: number) => [MEMBER_TRACKING_RECORD_RESOURCE, memberTrackingRecordId],
};

export const useMemberTrackingRecord = (memberTrackingRecordId: number) => {
  return useQuery<MemberTrackingRecord>(
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
export const useUpdateMemberTrackingRecord = (verb: Verb) => {
  const queryClient = useQueryClient();

  const [decreaseCategoryCount, increaseCategoryCound] = useMemberRecordTrackerState((state) => [
    state.decreaseCategoryCount,
    state.increaseCategoryCount,
  ]);

  return useMutation<MemberTrackingRecord, unknown, { memberTrackingRecord: RecordWithTrackingItem; userId: string }>(
    ({ memberTrackingRecord }) =>
      axios
        .post(`/api/${MEMBER_TRACKING_RECORD_RESOURCE}/${memberTrackingRecord.id}/${verb}`)
        .then((response) => response.data),
    {
      onMutate: ({ memberTrackingRecord }) => {
        const category = getCategory(memberTrackingRecord, memberTrackingRecord.trackingItem.interval);
        decreaseCategoryCount(category);
      },

      onSuccess: (data) => {
        //This will need to be updated when signing for authority
        queryClient.invalidateQueries(mtrQueryKeys.memberTrackingRecord(data.id));
      },
      onError: ({ memberTrackingRecord }) => {
        const category = getCategory(memberTrackingRecord, memberTrackingRecord.trackingItem.interval);
        increaseCategoryCound(category);
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
