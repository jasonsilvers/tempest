import axios from 'axios';
import { useQuery } from 'react-query';
import { UserWithAll } from '../../repositories/userRepo';
import { EUri, UsersDTO } from '../../types/global';

export const usersQueryKeys = {
  users: () => ['users'],
};

const useUsers = () => {
  return useQuery<UserWithAll[]>(usersQueryKeys.users(), async () => {
    return axios.get<UsersDTO>(EUri.USERS).then((result) => result.data.users);
  });
};

export { useUsers };
