import { MemberTrackingRecord } from '.prisma/client';
import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';

type Verb = 'sign_trainee' | 'sign_authority';

const MEMBER_TRACKING_RECORD_RESOURCE = 'membertrackingrecord';

export const useUpdateMemberTrackingRecord = (verb: Verb) => {
  const queryClient = useQueryClient();

  return useMutation<
    MemberTrackingRecord,
    unknown,
    { memberTrackingRecord: MemberTrackingRecord; userId: string }
  >(
    ({ memberTrackingRecord }) =>
      axios
        .post(
          `/api/${MEMBER_TRACKING_RECORD_RESOURCE}/${memberTrackingRecord.id}/${verb}`
        )
        .then((response) => response.data),
    {
      onSuccess: (data) => {
        //This will need to be updated when signing for authority
        queryClient.invalidateQueries(['profile', data.traineeId]);
      },
    }
  );
};

export const useCreateMemberTrackingRecord = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (memberTrackingRecord: Partial<MemberTrackingRecord>) =>
      axios
        .post(`/api/${MEMBER_TRACKING_RECORD_RESOURCE}`, memberTrackingRecord)
        .then((response) => response.data),
    {
      onSuccess: (data: MemberTrackingRecord) => {
        queryClient.invalidateQueries(['profile', data.traineeId]);
      },
    }
  );
};
