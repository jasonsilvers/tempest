import { JobResult, JobStatus, MemberTrackingItem, MemberTrackingRecord, TrackingItem, User } from '@prisma/client';
import {
  findJobById,
  findJobResultsByJobId,
  JobWithResults,
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

async function listOfMemberIdsUserCanView(reqUser: LoggedInUser) {
  const users = await getAllUsersFromUsersOrgCascade(reqUser.organizationId);
  return users.flatMap((user) => user.id);
}

async function findOrCreateMemberTrackingItem(item: BulkTrackingBodyItem, trackingItem: TrackingItem) {
  let memberTrackingItem = await findMemberTrackingItemByUserId(item.userId, trackingItem.id);

  if (!memberTrackingItem) {
    //create member tracking item
    const newMemberTrackingItem = {
      userId: item.userId,
      trackingItemId: item.trackingItemId,
      createdAt: null,
    } as MemberTrackingItem;
    memberTrackingItem = await createMemberTrackingItem(newMemberTrackingItem);
  }

  return memberTrackingItem;
}

function memberIsMissingTrackingRecord(
  memberTrackingItem: MemberTrackingItem & {
    memberTrackingRecords: MemberTrackingRecord[];
  }
) {
  if (!memberTrackingItem.memberTrackingRecords || memberTrackingItem.memberTrackingRecords.length === 0) {
    return true;
  }

  return memberTrackingItem.memberTrackingRecords?.every(
    (mtr) => mtr.authoritySignedDate !== null && mtr.traineeSignedDate !== null
  );
}

function userIsNotAllowedToCreateForMember(userIds: number[], item: BulkTrackingBodyItem) {
  return !userIds.includes(item.userId);
}

async function updateAllJobResults(jobId: number, status: JobStatus, message: string) {
  const jobResults = await findJobResultsByJobId(jobId);

  const queuedJobResults = jobResults?.filter((jobResult) => jobResult.status === JobStatus.QUEUED);

  if (!queuedJobResults) {
    return;
  }

  for (const jobResult of queuedJobResults) {
    await updateJobResult(jobResult.id, {
      status,
      success: false,
      message,
    });
  }
}

async function processItem(
  item: BulkTrackingBodyItem,
  job: JobWithResults,
  jobResult: JobResult & {
    forTrackingItem: TrackingItem;
    forUser: User;
  },
  userIds: number[]
) {
  const start = performance.now();
  let duration: number;
  const avgArray: number[] = [];

  try {
    if (userIsNotAllowedToCreateForMember(userIds, item)) {
      await updateJobResult(jobResult.id, {
        status: JobStatus.FAILED,
        success: false,
        message: `Unable to update user due to permissions or not found. UserId - ${item.userId}`,
      });
      return;
    }

    const trackingItem = await findTrackingItemById(item.trackingItemId);

    if (!trackingItem) {
      await updateJobResult(jobResult.id, {
        status: JobStatus.FAILED,
        success: false,
        message: `Unable to find trackingItem`,
      });
      return;
    }

    const memberTrackingItem = await findOrCreateMemberTrackingItem(item, trackingItem);

    if (memberIsMissingTrackingRecord(memberTrackingItem)) {
      const newMemberTrackingRecord = {
        trackingItemId: memberTrackingItem.trackingItemId,
        traineeId: item.userId,
      } as MemberTrackingRecord;

      await createMemberTrackingRecord(newMemberTrackingRecord);

      await updateJobResult(jobResult.id, {
        status: JobStatus.COMPLETED,
        success: true,
        message: 'Tracking Record Created',
      });

      return;
    }

    await updateJobResult(jobResult.id, {
      status: JobStatus.COMPLETED,
      success: true,
      message: 'Already assigned and has open record',
    });
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

export const trackingCreate = async (reqUser: LoggedInUser, body: BulkTrackingBodyItem[], jobId: number) => {
  try {
    //Need list of ids to check if logged in user has rights
    const userIds = await listOfMemberIdsUserCanView(reqUser);

    if (userIds.length === 0) {
      throw new Error('No users found');
    }

    for (const [index, item] of body.entries()) {
      //Get lateest version of job to see if it was killed
      const job = await findJobById(jobId);
      const jobResult = job.results[index];

      if (job.status === JobStatus.KILLED) {
        await updateAllJobResults(job.id, JobStatus.KILLED, 'Job was killed');
        break;
      }

      //Update job result ASAP in case there is an error
      await updateJobResult(jobResult.id, {
        forUserId: item.userId,
        forTrackingItemId: item.trackingItemId,
      });

      await processItem(item, job, jobResult, userIds);
    }
  } catch (error) {
    await updateJob(jobId, {
      status: JobStatus.FAILED,
      message: 'Unexpected Error occured, please try again ' + error,
    });

    updateAllJobResults(jobId, JobStatus.FAILED, 'Unexpected Error occured, please try again');
  }
};
