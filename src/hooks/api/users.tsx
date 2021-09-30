import { Role, User } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { UserWithAll } from '../../repositories/userRepo';
import { EUri, UsersDTO } from '../../types/global';

export const usersQueryKeys = {
  users: () => ['users'],
  member: (id: string) => ['member', id],
};

type SortOrder = 'ASC' | 'DESC';
const sortUsers = (userList: UserWithAll[], order: SortOrder = 'ASC') => {
  if (order === 'ASC') {
    return userList.sort((userA, userB) => (userA.lastName >= userB.lastName ? 1 : -1));
  }
  return userList.sort((userA, userB) => (userA.lastName > userB.lastName ? -1 : 1));
};

const useUsers = () => {
  return useQuery<UserWithAll[]>(usersQueryKeys.users(), async () => {
    return axios.get<UsersDTO>(EUri.USERS).then((result) => sortUsers(result.data.users));
  });
};

const useMember = (id, initialMemberData) => {
  return useQuery<User & { role: Role }>(
    usersQueryKeys.member(id),
    async () => axios.get<User & { role: Role }>(EUri.USERS + `${id}`).then((result) => result.data),
    { enabled: !!id, initialData: initialMemberData, placeholderData: initialMemberData }
  );
};

const useUpdateUser = () => {
  const { refreshUser } = useUser();
  const queryClient = useQueryClient();
  return useMutation<User, unknown, User>(
    (user: User) => axios.put(EUri.USERS + `${user.id}`, user).then((response) => response.data),
    {
      onSettled: () => {
        queryClient.invalidateQueries('member');
        refreshUser();
      },
    }
  );
};

export { useUsers, useUpdateUser, useMember };
