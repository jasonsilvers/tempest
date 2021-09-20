import { User } from '@prisma/client';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
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

const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, unknown, User>(
    (user: User) => axios.put(EUri.USERS + `${user.id}`, user).then((response) => response.data),
    {
      onSettled: () => {
        queryClient.invalidateQueries('loggedInUser');
        queryClient.invalidateQueries('users');
      },
    }
  );
};

export { useUsers, useUpdateUser };
