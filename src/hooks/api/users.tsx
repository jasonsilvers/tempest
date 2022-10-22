import { User } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { EMtrVariant, EUri } from '../../const/enums';
import { MemberTrackingItemWithAll } from '../../repositories/memberTrackingRepo';
import { UserWithAll } from '../../repositories/userRepo';
import { UsersDTO } from '../../types';
import { removeOldCompletedRecords } from '../../utils';
import { MEMBER_TRACKING_ITEM_RESOURCE, mtiQueryKeys } from './memberTrackingItem';

export const usersQueryKeys = {
  users: (detached = false) => (detached ? ['users', 'detached'] : ['users']),
  member: (id: number) => ['member', id],
};

const sortMemberTrackingItems = (memberTrackingItems: MemberTrackingItemWithAll[]) => {
  return memberTrackingItems.sort((mtiA, mtiB) => (mtiA.trackingItem.title >= mtiB.trackingItem.title ? 1 : -1));
};

export const fetchMemberTrackingItems = async (
  userId: number,
  variant: EMtrVariant = EMtrVariant.ALL
): Promise<MemberTrackingItemWithAll[]> => {
  const { data } = await axios.get<UserWithAll>(EUri.USERS + `${userId}/${MEMBER_TRACKING_ITEM_RESOURCE}/${variant}`);

  return sortMemberTrackingItems(data.memberTrackingItems);
};

/**
 * Array MTI Query
 * @param userId
 * @returns
 */
const useMemberTrackingItemsForUser = (userId: number, variant: EMtrVariant = EMtrVariant.ALL) => {
  return useQuery<MemberTrackingItemWithAll[], unknown, MemberTrackingItemWithAll[]>(
    mtiQueryKeys.memberTrackingItems(userId, variant),
    () => fetchMemberTrackingItems(userId, variant),
    {
      enabled: !!userId,
      select: (memberTrackingItems) => {
        memberTrackingItems.forEach(
          (mti) => (mti.memberTrackingRecords = removeOldCompletedRecords(mti.memberTrackingRecords))
        );

        return memberTrackingItems.filter((mti) => mti.memberTrackingRecords.length !== 0);
      },
    }
  );
};

const sortUsers = (userList: UserWithAll[]) => {
  return userList.sort((userA, userB) => (userA.lastName >= userB.lastName ? 1 : -1));
};

const useUsers = ({ detached }: { detached?: boolean } = {}) => {
  const uri = detached ? `${EUri.USERS}?detached=true` : EUri.USERS;

  return useQuery<UserWithAll[]>(usersQueryKeys.users(detached), async () => {
    return axios.get<UsersDTO>(uri).then((result) => sortUsers(result.data.users));
  });
};

const useMember = (id: number, initialMemberData: UserWithAll) => {
  return useQuery<UserWithAll>(
    usersQueryKeys.member(id),
    async () => axios.get<UserWithAll>(EUri.USERS + `${id}`).then((result) => result.data),
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

const useDeleteUser = () => {
  return useMutation((userId: number) => axios.delete(`${EUri.USERS}${userId}`).then((result) => result.data));
};

export { useUsers, useUpdateUser, useMember, useMemberTrackingItemsForUser, useDeleteUser };
