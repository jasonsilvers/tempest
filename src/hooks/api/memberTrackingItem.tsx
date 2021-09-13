import { MemberTrackingItem, TrackingItem } from '.prisma/client';
import { MemberTrackingRecord } from '@prisma/client';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { MemberTrackingItemWithAll } from '../../repositories/memberTrackingRepo';
import { UserWithAll } from '../../repositories/userRepo';
import { EUri } from '../../types/global';

const MEMBER_TRACKING_ITEM_RESOURCE = 'membertrackingitems';

export const mtiQueryKeys = {
  memberTrackingItems: (userId: string) => [MEMBER_TRACKING_ITEM_RESOURCE, userId],
  memberTrackingItem: (userId: string, trackingItemId: number) => [
    MEMBER_TRACKING_ITEM_RESOURCE,
    userId,
    trackingItemId,
  ],
};

export const fetchMemberTrackingItems = async (userId: string): Promise<UserWithAll> => {
  const { data } = await axios.get(EUri.USERS + `${userId}/${MEMBER_TRACKING_ITEM_RESOURCE}`);

  return data.memberTrackingItems;
};

/**
 * Array MTI Query
 * @param userId
 * @returns
 */
const useMemberTrackingItems = (userId: string) => {
  return useQuery<UserWithAll, unknown, MemberTrackingItem[]>(
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
        const memberTrackingRecords = memberTrackingItem.memberTrackingRecords;
        const inProgressMemberTrackingRecords = memberTrackingRecords.filter(
          (mtr) => mtr.authoritySignedDate === null || mtr.traineeSignedDate === null || mtr.completedDate === null
        );

        const latestCompleteMemberTrackingRecord = memberTrackingRecords
          .filter(
            (mtr) => mtr.authoritySignedDate !== null && mtr.traineeSignedDate !== null && mtr.completedDate !== null
          )
          .sort((firstMtr, secondMtr) => {
            if (firstMtr.completedDate < secondMtr.completedDate) {
              return 1;
            }

            if (firstMtr.completedDate > secondMtr.completedDate) {
              return -1;
            }

            return 0;
          })[0];

        const memberTrackingRecordList = [...inProgressMemberTrackingRecords, latestCompleteMemberTrackingRecord]
          .filter((mtr) => mtr !== undefined)
          .map((i) => ({ id: i?.id }));

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
