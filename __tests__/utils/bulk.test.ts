import { JobStatus } from '@prisma/client';

import { findJobById, findJobResultsByJobId, updateJob, updateJobResult } from '../../src/repositories/jobRepo';
import {
  createMemberTrackingItem,
  createMemberTrackingRecord,
  findMemberTrackingItemByUserId,
} from '../../src/repositories/memberTrackingRepo';
import { findTrackingItemById } from '../../src/repositories/trackingItemRepo';
import { getAllUsersFromUsersOrgCascade } from '../../src/repositories/userRepo';
import { trackingCreate } from '../../src/utils/bulk';
import { andrewMonitor, bobJones } from '../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../testutils/mocks/repository';

jest.mock('../../src/repositories/userRepo');
jest.mock('../../src/repositories/jobRepo');
jest.mock('../../src/repositories/trackingItemRepo');
jest.mock('../../src/repositories/memberTrackingRepo.ts');

const testJob = {
  id: 29,
  message: 'Started at \tTue, Jun 21, 2022 8:33 AM',
  progress: 1,
  status: JobStatus.WORKING,
  total: 1,
  url: '/api/jobs/29',
  startedById: 321,
  avgProcessingTime: null,
  results: [{ id: 1, status: JobStatus.QUEUED, success: false, message: null, jobId: 29 }],
};

const trackingItemFromDb = {
  id: 2,
  title: 'Fire Extinguisher',
  description: 'This is a test item',
  interval: 365,
};

const memberTrackingItemFromDb = {
  userId: 2,
  user: {
    id: 2,
    organizationId: 123,
  },
  trackingItemId: 2,
  isActive: true,
};

const memberTrackingRecordFromDb = {
  trackingItemId: 2,
  traineeId: 123,
  authorityId: null,
  authoritySignedDate: null,
  traineeSignedDate: null,
  completedDate: null,
};

test('job should fail if list of ids is empty', async () => {
  const jobResult = {
    status: JobStatus.FAILED,
    message: 'Unexpected Error occured, please try again Error: No users found',
  };
  mockMethodAndReturn(getAllUsersFromUsersOrgCascade, []);
  mockMethodAndReturn(updateJob, testJob);
  mockMethodAndReturn(updateJobResult, jobResult);

  await trackingCreate(andrewMonitor, [], 1);

  expect(updateJob).toHaveBeenCalledWith(1, jobResult);
});

test('job result should fail if user is not allowed to create for member', async () => {
  const testBody = [
    {
      userId: 4563,
      trackingItemId: 2,
      isActive: true,
    },
  ];
  const jobResult = {
    message: 'Unable to update user due to permissions or not found. UserId - 4563',
    status: JobStatus.FAILED,
    success: false,
  };
  mockMethodAndReturn(getAllUsersFromUsersOrgCascade, [bobJones]);
  mockMethodAndReturn(updateJobResult, jobResult);
  mockMethodAndReturn(findJobById, testJob);
  const spyFindTrackingItemById = mockMethodAndReturn(findTrackingItemById, trackingItemFromDb);

  await trackingCreate(andrewMonitor, testBody, 1);
  expect(updateJobResult).toHaveBeenCalledWith(1, jobResult);
  expect(spyFindTrackingItemById).not.toHaveBeenCalled();
});

test('Bulk create should stop if job was killed', async () => {
  const testBody = [
    {
      userId: 4563,
      trackingItemId: 2,
      isActive: true,
    },
  ];

  const jobResult = {
    status: JobStatus.KILLED,
    success: false,
    message: 'Job was killed',
  };

  const jobResult1 = {
    id: 1,
    status: JobStatus.COMPLETED,
    success: true,
    message: 'Updated',
    userId: 123,
  };

  const jobResult2 = {
    id: 2,
    status: JobStatus.QUEUED,
    success: false,
    message: null,
    userId: 123,
  };

  mockMethodAndReturn(getAllUsersFromUsersOrgCascade, [bobJones]);
  mockMethodAndReturn(updateJobResult, jobResult);
  mockMethodAndReturn(findJobById, { ...testJob, status: JobStatus.KILLED });
  mockMethodAndReturn(findJobResultsByJobId, [jobResult1, jobResult2]);

  await trackingCreate(andrewMonitor, testBody, 1);

  expect(updateJobResult).toBeCalledTimes(1);
  expect(updateJobResult).lastCalledWith(2, jobResult);
});

test('job result should fail if tracking item is not found', async () => {
  const testBody = [
    {
      userId: 123,
      trackingItemId: 2,
      isActive: true,
    },
  ];
  const jobResult = {
    status: JobStatus.FAILED,
    success: false,
    message: 'Unable to find trackingItem',
  };
  mockMethodAndReturn(getAllUsersFromUsersOrgCascade, [bobJones]);
  mockMethodAndReturn(updateJobResult, jobResult);
  mockMethodAndReturn(findJobById, testJob);
  const jestMockedFindTrackingItemById = findTrackingItemById as jest.MockedFunction<typeof findTrackingItemById>;
  jestMockedFindTrackingItemById.mockImplementation(() => Promise.resolve(null));

  const spyFindMemberTrackingItemByUserId = mockMethodAndReturn(findMemberTrackingItemByUserId, null);

  await trackingCreate(andrewMonitor, testBody, 1);

  expect(updateJobResult).lastCalledWith(1, jobResult);
  expect(spyFindMemberTrackingItemByUserId).not.toHaveBeenCalled();
});

test('should create member tracking item and member tracking record', async () => {
  const testBody = [
    {
      userId: 123,
      trackingItemId: 2,
      isActive: true,
    },
  ];
  const jobResult = {
    status: JobStatus.COMPLETED,
    success: true,
    message: 'Tracking Record Created',
  };
  mockMethodAndReturn(getAllUsersFromUsersOrgCascade, [bobJones]);
  mockMethodAndReturn(updateJobResult, jobResult);
  mockMethodAndReturn(findJobById, testJob);
  mockMethodAndReturn(findTrackingItemById, trackingItemFromDb);
  mockMethodAndReturn(findMemberTrackingItemByUserId, null);
  mockMethodAndReturn(createMemberTrackingItem, memberTrackingItemFromDb);
  mockMethodAndReturn(createMemberTrackingRecord, memberTrackingRecordFromDb);

  await trackingCreate(andrewMonitor, testBody, 1);

  expect(updateJobResult).lastCalledWith(1, jobResult);
});

test('should not create member tracking item and create member tracking record if they already exist', async () => {
  const testBody = [
    {
      userId: 123,
      trackingItemId: 2,
      isActive: true,
    },
  ];
  const jobResult = {
    status: JobStatus.COMPLETED,
    success: true,
    message: 'Already assigned and has open record',
  };
  mockMethodAndReturn(getAllUsersFromUsersOrgCascade, [bobJones]);
  mockMethodAndReturn(updateJobResult, jobResult);
  mockMethodAndReturn(findJobById, testJob);
  mockMethodAndReturn(findTrackingItemById, trackingItemFromDb);
  mockMethodAndReturn(findMemberTrackingItemByUserId, {
    ...memberTrackingItemFromDb,
    memberTrackingRecords: [memberTrackingRecordFromDb],
  });

  const spyCreateMemberTrackingItem = mockMethodAndReturn(createMemberTrackingItem, null);
  const spyCreateMemberTrackingRecord = mockMethodAndReturn(createMemberTrackingRecord, null);

  await trackingCreate(andrewMonitor, testBody, 1);

  expect(updateJobResult).lastCalledWith(1, jobResult);
  expect(spyCreateMemberTrackingItem).not.toHaveBeenCalled();
  expect(spyCreateMemberTrackingRecord).not.toHaveBeenCalled();
});

test('should catch error when creating mti or mtr', async () => {
  const testBody = [
    {
      userId: 123,
      trackingItemId: 2,
      isActive: true,
    },
  ];
  const jobResult = {
    status: JobStatus.FAILED,
    success: false,
    message: 'Error while trying to create Error: Test',
  };
  mockMethodAndReturn(getAllUsersFromUsersOrgCascade, [bobJones]);
  mockMethodAndReturn(updateJobResult, jobResult);
  mockMethodAndReturn(findJobById, testJob);
  mockMethodAndReturn(findTrackingItemById, trackingItemFromDb);
  const mockedFindTrackingItemById = findTrackingItemById as jest.MockedFunction<typeof findTrackingItemById>;
  mockedFindTrackingItemById.mockImplementation(() => {
    throw new Error('Test');
  });

  await trackingCreate(andrewMonitor, testBody, 1);

  expect(updateJobResult).lastCalledWith(1, jobResult);
});

test('should catch error when trying to get list of membersIds user can view', async () => {
  const testBody = [
    {
      userId: 123,
      trackingItemId: 2,
      isActive: true,
    },
  ];
  const jobResult1 = {
    id: 1,
    status: JobStatus.COMPLETED,
    success: true,
    message: 'Updated',
    userId: 123,
  };

  const jobResult2 = {
    id: 2,
    status: JobStatus.QUEUED,
    success: false,
    message: null,
    userId: 123,
  };

  const updatedJobResult = {
    status: JobStatus.FAILED,
    success: false,
    message: 'Unexpected Error occured, please try again',
    userId: 123,
  };

  mockMethodAndReturn(updateJob, testJob);
  mockMethodAndReturn(updateJobResult, updatedJobResult);
  mockMethodAndReturn(getAllUsersFromUsersOrgCascade, [bobJones]);

  const mockedGetAllUsers = getAllUsersFromUsersOrgCascade as jest.MockedFunction<
    typeof getAllUsersFromUsersOrgCascade
  >;
  mockedGetAllUsers.mockImplementation(() => {
    throw new Error('Test');
  });

  mockMethodAndReturn(findJobResultsByJobId, [jobResult1, jobResult2]);

  await trackingCreate(andrewMonitor, testBody, 1);

  expect(updateJob).toHaveBeenCalled();
});
