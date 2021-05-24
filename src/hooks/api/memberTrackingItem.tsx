import { MemberTrackingItem } from '.prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { UserWithAll } from '../../repositories/userRepo';

const fetchUserWithTrackingItems = async (
  userId: string
): Promise<UserWithAll> => {
  const { data } = await axios.get(
    `/api/user/${userId}/membertrackingitems?include=membertrackingrecords&include=trackingitems`
  );

  return data;
};

const useMemberTrackingItems = (userId: string) => {
  return useQuery(
    ['membertrackingitems', userId],
    () => fetchUserWithTrackingItems(userId),
    {
      select: (user) => user.memberTrackingItems,
      enabled: !!userId,
    }
  );
};

const useCreateMemberTrackingItemAndRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<MemberTrackingItem>,
    unknown,
    { newMemberTrackingItem: MemberTrackingItem; completedDate: string }
  >(
    ({ newMemberTrackingItem, completedDate }) =>
      axios
        .post(`/api/membertrackingitem`, newMemberTrackingItem, {
          params: {
            create_member_tracking_record: true,
            complete_date: completedDate,
          },
        })
        .then((result) => result.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
      },
    }
  );
};

export { useMemberTrackingItems, useCreateMemberTrackingItemAndRecord };
