//Add an include request parameter with
//Can include membertracking
// - /api/membertrackingitem?include=member_tracking_records&include=another_thing

// POST /api/membertrackingitem?create_member_tracking_record

import { NextApiRequest, NextApiResponse } from 'next';
import {
  createTrackingItem,
  createTrackingRecord,
  MemberTrackingItemWithMemberTrackingRecord,
} from '../../../repositories/memberTrackingRepo';

const memberTrackingItemHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  //Include can be a string or string[]
  const { body, method, query } = req;

  console.log('the query in the handler is', query);
  // console.log('The creat member tracking record in the hanlder is', create_member_tracking_record)

  switch (method) {
    case 'POST': {
      const newMemberTrackingItem: MemberTrackingItemWithMemberTrackingRecord = await createTrackingItem(
        body
      );

      // if (create_member_tracking_record) {
      //   const newMemberTrackingRecord = await createTrackingRecord(
      //     {
      //       order: 0,
      //       traineeId: newMemberTrackingItem.userId,
      //       trackingItemId: newMemberTrackingItem.trackingItemId,
      //     },
      //     { includeTrackingItem: true }
      //   );

      //   newMemberTrackingItem.memberTrackingRecords = [newMemberTrackingRecord];
      // }

      res.status(200).json(newMemberTrackingItem);
    }
    default:
    //only allow post
  }

  // res.status(200).json('This is the response');
};

export default memberTrackingItemHandler;
