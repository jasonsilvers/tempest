import { MemberTrackingRecord } from '.prisma/client';
import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';

type Verb = 'sign_trainee' | 'sign_authority';

export const useUpdateMemberTrackingRecord = (verb: Verb) => {
  const queryClient = useQueryClient();

  return useMutation<
    MemberTrackingRecord,
    unknown,
    { memberTrackingRecord: MemberTrackingRecord; userId: string }
  >(
    ({ memberTrackingRecord }) =>
      axios
        .post(`/api/membertrackingrecord/${memberTrackingRecord.id}/${verb}`)
        .then((response) => response.data),
    {
      onSuccess: (data: MemberTrackingRecord) => {
        //This will need to be updated when signing for authority
        queryClient.invalidateQueries(['profile', data.traineeId]);
      },
    }
  );
};
