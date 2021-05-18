import axios from 'axios';
import { useQuery } from 'react-query';
import { UserWithAll } from '../../repositories/userRepo';

const fetchUserWithTrackingItems = async (userId: string) => {
  const { data } = await axios.get(
    `/api/user/${userId}/membertrackingitems?include=membertrackingrecords&include=trackingitems`
  );

  return data;
};

const useProfile = (userId: string) => {
  return useQuery<UserWithAll, Error>(['profile', userId], () =>
    fetchUserWithTrackingItems(userId)
  );
};

export { useProfile };
