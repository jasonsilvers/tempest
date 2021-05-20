import axios from 'axios';
import { useQuery } from 'react-query';
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
    ['profile', userId],
    () => fetchUserWithTrackingItems(userId),
    {
      select: (user) => user.memberTrackingItems,
      enabled: !!userId,
    }
  );
};

export { useMemberTrackingItems };
