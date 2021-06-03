import { MemberTrackingItem, TrackingItem } from '.prisma/client';
import { MemberTrackingRecord } from '@prisma/client';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { MemberTrackingItemWithAll } from '../../repositories/memberTrackingRepo';
import { UserWithAll } from '../../repositories/userRepo';

const MEMBER_TRACKING_ITEM_RESOURCE = 'membertrackingitems';

export const mtiQueryKeys = {
  memberTrackingItems: (userId: string) => ['membertrackingitems', userId],
  memberTrackingItem: (userId: string, trackingItemId: number) => ['membertrackingitem', userId, trackingItemId],
};

const fetchUserWithMemberTrackingItems = async (userId: string): Promise<UserWithAll> => {
  const { data } = await axios.get(`/api/users/${userId}/${MEMBER_TRACKING_ITEM_RESOURCE}`);

  return data;
};

/**
 * Array MTI Query
 * @param userId
 * @returns
 */
const useMemberTrackingItems = (userId: string) => {
  return useQuery<UserWithAll, unknown, MemberTrackingItem[]>(
    mtiQueryKeys.memberTrackingItems(userId),
    () => fetchUserWithMemberTrackingItems(userId),
    {
      select: (user) => {
        return user.memberTrackingItems;
      },
      enabled: !!userId,
    }
  );
};

type MemberTrackingItemData = MemberTrackingItem & {
  trackingItem: TrackingItem;
  memberTrackingRecords: Pick<MemberTrackingRecord, 'id'>[];
};
/**
 * Single MTI Query
 * @param userId
 * @param trackingItemId
 * @returns
 */
export const useMemberTrackingItem = (userId: string, trackingItemId: number) => {
  return useQuery<MemberTrackingItemWithAll, unknown, MemberTrackingItemData>(
    mtiQueryKeys.memberTrackingItem(userId, trackingItemId),
    () =>
      axios
        .get(
          `/api/${MEMBER_TRACKING_ITEM_RESOURCE}?userId=${userId}&trackingItemId=${trackingItemId}&include=membertrackingrecords&include=trackingitems`
        )
        .then((response) => response.data),
    {
      enabled: !!userId && !!trackingItemId,
      select: (memberTrackingItem): MemberTrackingItemData => {
        return {
          ...memberTrackingItem,
          memberTrackingRecords: memberTrackingItem.memberTrackingRecords.map((i) => ({ id: i.id })),
        };
      },
    }
  );
};

const useCreateMemberTrackingItemAndRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<MemberTrackingItem, unknown, { newMemberTrackingItem: MemberTrackingItem; completedDate: string }>(
    ({ newMemberTrackingItem, completedDate }) =>
      axios
        .post(`/api/${MEMBER_TRACKING_ITEM_RESOURCE}`, newMemberTrackingItem, {
          params: {
            create_member_tracking_record: true,
            complete_date: completedDate,
          },
        })
        .then((result) => result.data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItems(data.userId));
      },
    }
  );
};

export { useMemberTrackingItems, useCreateMemberTrackingItemAndRecord };
