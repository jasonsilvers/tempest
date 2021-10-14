import { MemberTrackingItem, TrackingItem } from '.prisma/client';
import { MemberTrackingRecord } from '@prisma/client';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { MemberTrackingItemWithAll } from '../../repositories/memberTrackingRepo';
import { UserWithAll } from '../../repositories/userRepo';
import { EUri } from '../../const/enums';
import { removeOldCompletedRecords } from '../../utils';

const MEMBER_TRACKING_ITEM_RESOURCE = 'membertrackingitems';

type SortOrder = 'ASC' | 'DESC';
const sortMemberTrackingItems = (memberTrackingItems: MemberTrackingItemWithAll[], order: SortOrder = 'ASC') => {
  if (order === 'ASC') {
    return memberTrackingItems.sort((mtiA, mtiB) => (mtiA.trackingItem.title >= mtiB.trackingItem.title ? 1 : -1));
  }
  return memberTrackingItems.sort((mtiA, mtiB) => (mtiA.trackingItem.title > mtiB.trackingItem.title ? -1 : 1));
};

export const mtiQueryKeys = {
  memberTrackingItems: (userId: string) => [MEMBER_TRACKING_ITEM_RESOURCE, userId],
  memberTrackingItem: (userId: string, trackingItemId: number) => [
    MEMBER_TRACKING_ITEM_RESOURCE,
    userId,
    trackingItemId,
  ],
};

export const fetchMemberTrackingItems = async (userId: string): Promise<MemberTrackingItemWithAll[]> => {
  const { data } = await axios.get<UserWithAll>(
    EUri.USERS + `${userId}/${MEMBER_TRACKING_ITEM_RESOURCE}?include=trackingitem`
  );

  return sortMemberTrackingItems(data.memberTrackingItems);
};

/**
 * Array MTI Query
 * @param userId
 * @returns
 */
const useMemberTrackingItems = (userId: string) => {
  return useQuery<MemberTrackingItemWithAll[], unknown, MemberTrackingItem[]>(
    mtiQueryKeys.memberTrackingItems(userId),
    () => fetchMemberTrackingItems(userId),
    {
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
        const memberTrackingRecordList = removeOldCompletedRecords(memberTrackingItem.memberTrackingRecords).map(
          (i) => ({ id: i?.id })
        );

        return {
          ...memberTrackingItem,
          memberTrackingRecords: memberTrackingRecordList,
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
