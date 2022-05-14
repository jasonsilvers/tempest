import { MemberTrackingItem } from '.prisma/client';
import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';
import { EMtrVariant } from '../../const/enums';

export const MEMBER_TRACKING_ITEM_RESOURCE = 'membertrackingitems';

export const mtiQueryKeys = {
  memberTrackingItems: (userId: number, variant: EMtrVariant) => [MEMBER_TRACKING_ITEM_RESOURCE, userId, variant],
  memberTrackingItem: (userId: number, trackingItemId: number) => [
    MEMBER_TRACKING_ITEM_RESOURCE,
    userId,
    trackingItemId,
  ],
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
        queryClient.invalidateQueries(mtiQueryKeys.memberTrackingItems(data.userId, EMtrVariant.IN_PROGRESS));
      },
    }
  );
};

export { useCreateMemberTrackingItemAndRecord };
