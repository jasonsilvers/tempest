import { User } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import axios from 'axios';
import { useMutation, useQuery } from 'react-query';
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
  const { refreshUser } = useUser();
  return useMutation<User, unknown, User>(
    (user: User) => axios.put(EUri.USERS + `${user.id}`, user).then((response) => response.data),
    {
      onSettled: () => {
        refreshUser();
      },
    }
  );
};

export { useUsers, useUpdateUser };
