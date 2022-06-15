import { JobStatus, MemberTrackingItem, MemberTrackingRecord } from '@prisma/client';
import {
  createJob,
  createJobResults,
  findJobById,
  findJobResultsByJob,
  updateJob,
  updateJobResult,
} from '../repositories/jobRepo';
import {
  createMemberTrackingItem,
  createMemberTrackingRecord,
  findMemberTrackingItemByUserId,
} from '../repositories/memberTrackingRepo';
import { findTrackingItemById } from '../repositories/trackingItemRepo';
import { getAllUsersFromUsersOrgCascade, LoggedInUser } from '../repositories/userRepo';

export type BulkTrackingBodyItem = {
  userId: number;
  trackingItemId: number;
  isActive: boolean;
};

//Loop through the results
//First check if Job has been killed
// Update the result table with item status
//1. Check that the userId is allowed to be updated by the requestor
//2. Check if userId already has that tracking item assigned
//3. If not assign it
//4. Check if userId alread has an open tracking record
//5. If not create one
//update the result table with item status
//if last item update job table status

export const trackingCreate = async (reqUser: LoggedInUser, body: BulkTrackingBodyItem[]) => {
  try {
    const users = await getAllUsersFromUsersOrgCascade(reqUser.organizationId);
    const userIds = users.flatMap((user) => user.id);

    const newJob = await createJob(body.length, reqUser.id);
    await createJobResults(newJob.id, body.length);
    const jobResults = await findJobResultsByJob(newJob.id);
    let start: number;
    let duration: number;
    const avgArray: number[] = [];

    for (const [index, item] of body.entries()) {
      start = performance.now();
      const job = await findJobById(newJob.id);
      const jobResult = jobResults[index];

      if (job.status === JobStatus.KILLED) {
        await updateJobResult(jobResult.id, { status: JobStatus.KILLED, success: false, message: 'Job was killed' });
        continue;
      }

      try {
        if (!userIds.includes(item.userId)) {
          await updateJobResult(jobResult.id, {
            status: JobStatus.FAILED,
            success: false,
            message: `Unable to update user due to permissions or not found. UserId - ${item.userId}`,
          });
          continue;
        }

        const trackingItem = await findTrackingItemById(item.trackingItemId);

        if (!trackingItem) {
          await updateJobResult(jobResult.id, {
            status: JobStatus.FAILED,
            success: false,
            message: `Unable to find trackingItem`,
          });
          continue;
        }

        let memberTrackingItem = await findMemberTrackingItemByUserId(item.userId, trackingItem.id);

        if (!memberTrackingItem) {
          //create member tracking item
          const newMemberTrackingItem = {
            isActive: item.isActive,
            userId: item.userId,
            trackingItemId: item.trackingItemId,
            createdAt: null,
          } as MemberTrackingItem;
          memberTrackingItem = await createMemberTrackingItem(newMemberTrackingItem);
        }

        if (
          memberTrackingItem.memberTrackingRecords.some(
            (mtr) => mtr.authoritySignedDate === null || mtr.traineeSignedDate === null
          )
        ) {
          await updateJobResult(jobResult.id, {
            status: JobStatus.COMPLETED,
            success: true,
            message: 'Already assigned and has open record',
          });
          continue;
        } else {
          const newMemberTrackingRecord = {
            trackingItemId: memberTrackingItem.trackingItemId,
            traineeId: item.userId,
            order: memberTrackingItem.memberTrackingRecords.length + 1,
          } as MemberTrackingRecord;

          await createMemberTrackingRecord(newMemberTrackingRecord);

          await updateJobResult(jobResult.id, {
            status: JobStatus.COMPLETED,
            success: true,
            message: 'Tracking item assigned',
          });
        }

        await updateJob(job.id, { progress: job.progress + 1 });
      } catch (error) {
        await updateJobResult(jobResult.id, {
          status: JobStatus.FAILED,
          success: false,
          message: `Error while trying to create ${error}`,
        });
      } finally {
        duration = performance.now() - start;
        avgArray.push(duration);

        const average = avgArray.reduce((avg, value, _, { length }) => avg + value / length, 0);

        await updateJob(job.id, {
          progress: job.progress + 1,
          status: job.progress + 1 === job.total ? JobStatus.COMPLETED : JobStatus.WORKING,
          url: `/api/jobs/${job.id}`,
          avgProcessingTime: average,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};
