import { JobStatus } from '@prisma/client';
import { rest, server } from '../../testutils/mocks/msw';
import { fireEvent, queryByText, render, userEvent, waitForElementToBeRemoved } from '../../testutils/TempestTestUtils';
import { MassAssign } from '../../../src/components/Dashboard/MassAssign';
import { UseQueryResult } from 'react-query';
import { UserWithAll } from '../../../src/repositories/userRepo';
import { EUri } from '../../../src/const/enums';

const trackingItemsList = {
  trackingItems: [
    { id: 1, title: 'Fire Extinguisher', description: 'This is a AF yearly requirment', interval: 365 },
    { id: 2, title: 'Supervisor Safety Training', description: 'One time training for new supevisors', interval: 0 },
    { id: 3, title: 'Fire Safety', description: 'How to be SAFE when using Fire', interval: 60 },
    { id: 4, title: 'Big Bug Safety', description: 'There are big bugs in Hawaii!  Be careful!', interval: 365 },
  ],
};

const createJson = {
  id: 14,
  message: 'Started at \tTue, Jun 28, 2022 1:13 PM',
  progress: 0,
  status: 'WORKING',
  total: 1,
  url: '/api/jobs/14',
  startedById: 1,
  avgProcessingTime: null,
  results: [
    { id: 313, status: 'QUEUED', success: false, message: null, forUserId: null, forTrackingItemId: null, jobId: 14 },
  ],
};

const progressJson = {
  id: 14,
  message: 'Started at \tTue, Jun 28, 2022 1:13 PM',
  progress: 0,
  status: 'WORKING',
  total: 1,
  url: '/api/jobs/14',
  startedById: 1,
  avgProcessingTime: 25.43,
  results: [
    { id: 313, status: 'QUEUED', success: false, message: null, forUserId: null, forTrackingItemId: null, jobId: 14 },
    { id: 314, status: 'QUEUED', success: false, message: null, forUserId: null, forTrackingItemId: null, jobId: 14 },
  ],
};

const jobJson = {
  id: 15,
  message: 'Started at \tTue, Jun 28, 2022 1:19 PM',
  progress: 1,
  status: 'COMPLETED',
  total: 1,
  url: '/api/jobs/15',
  startedById: 1,
  avgProcessingTime: 156.6815069913864,
  results: [
    {
      id: 314,
      status: 'COMPLETED',
      success: true,
      message: 'Already assigned and has open record',
      forUserId: 16,
      forTrackingItemId: 5,
      jobId: 15,
      forUser: {
        id: 16,
        firstName: 'Braeden',
        lastName: 'Auer',
        middleName: null,
        email: 'Kristoffer_Gusikowski@gmail.com',
        createdAt: '2022-06-28T20:31:26.607Z',
        updatedAt: '2022-06-28T20:31:26.608Z',
        lastLogin: null,
        roleId: 2,
        organizationId: 1,
        rank: 'SSgt/E-5',
        afsc: '5L4X5',
        dutyTitle: 'Nihil sit',
      },
      forTrackingItem: {
        id: 5,
        title: 'Keyboard Warrior Training',
        description: 'How to be a true keyboard warrior via writing code',
        interval: 180,
      },
    },
  ],
};

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

beforeEach(() => {
  server.use(
    rest.get(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(trackingItemsList));
    }),
    rest.post(EUri.BULK_CREATE, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(createJson));
    }),
    rest.get(EUri.JOBS + '14', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(jobJson));
    })
  );
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

const usersQuery = {
  status: 'success',
  isLoading: false,
  isSuccess: true,
  isError: false,
  isIdle: false,
  data: [
    {
      id: 9,
      firstName: 'Edmond',
      lastName: 'Adams',
      middleName: null,
      email: 'Shields_Carlee@Quigley.biz',
      createdAt: '2022-06-28T20:31:26.550Z',
      updatedAt: '2022-06-28T20:31:26.551Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '4I6X4',
      dutyTitle: 'Asperiores eum natus',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 9,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 21,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:46.412Z',
              completedDate: null,
              order: 6,
              traineeId: 9,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 9,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 22,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:46.463Z',
              completedDate: null,
              order: 8,
              traineeId: 9,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 9,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 23,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:46.514Z',
              completedDate: null,
              order: 5,
              traineeId: 9,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 9,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 24,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:46.564Z',
              completedDate: null,
              order: 2,
              traineeId: 9,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 9,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 25,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:46.613Z',
              completedDate: null,
              order: 4,
              traineeId: 9,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 1,
      firstName: 'Joe',
      lastName: 'Admin',
      middleName: null,
      email: 'joe.admin@gmail.com',
      createdAt: '2022-06-28T20:31:26.482Z',
      updatedAt: '2022-06-28T21:09:54.226Z',
      lastLogin: '2022-06-28T20:31:57.494Z',
      roleId: 1,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '6L5X3',
      dutyTitle: 'Delectus laudantium',
      role: {
        id: 1,
        name: 'admin',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 1,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 8,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:52:32.579Z',
              completedDate: null,
              order: 1,
              traineeId: 1,
              trackingItemId: 2,
            },
          ],
        },
        {
          isActive: true,
          userId: 1,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 9,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:52:32.726Z',
              completedDate: null,
              order: 5,
              traineeId: 1,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 1,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 12,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:52:59.161Z',
              completedDate: null,
              order: 2,
              traineeId: 1,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 1,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 13,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:52:59.245Z',
              completedDate: null,
              order: 3,
              traineeId: 1,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 1,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 26,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:46.813Z',
              completedDate: null,
              order: 3,
              traineeId: 1,
              trackingItemId: 1,
            },
          ],
        },
      ],
    },
    {
      id: 19,
      firstName: 'Verna',
      lastName: 'Altenwerth',
      middleName: null,
      email: 'Mervin_Wolf@hotmail.com',
      createdAt: '2022-06-28T20:31:26.633Z',
      updatedAt: '2022-06-28T20:31:26.634Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '3J6X4',
      dutyTitle: 'Et nesciunt et',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 19,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 7,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:39:04.600Z',
              completedDate: null,
              order: 4,
              traineeId: 19,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 19,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 17,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:55:06.863Z',
              completedDate: null,
              order: 5,
              traineeId: 19,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 19,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 27,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:46.962Z',
              completedDate: null,
              order: 6,
              traineeId: 19,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 19,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 28,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.006Z',
              completedDate: null,
              order: 4,
              traineeId: 19,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 19,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 29,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.053Z',
              completedDate: null,
              order: 5,
              traineeId: 19,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 16,
      firstName: 'Braeden',
      lastName: 'Auer',
      middleName: null,
      email: 'Kristoffer_Gusikowski@gmail.com',
      createdAt: '2022-06-28T20:31:26.607Z',
      updatedAt: '2022-06-28T20:31:26.608Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '5L4X5',
      dutyTitle: 'Nihil sit',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 16,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 6,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:32:58.950Z',
              completedDate: null,
              order: 2,
              traineeId: 16,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 16,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 16,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:55:06.808Z',
              completedDate: null,
              order: 7,
              traineeId: 16,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 16,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 18,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:46.225Z',
              completedDate: null,
              order: 4,
              traineeId: 16,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 16,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 19,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:46.303Z',
              completedDate: null,
              order: 1,
              traineeId: 16,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 16,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 20,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:46.358Z',
              completedDate: null,
              order: 3,
              traineeId: 16,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 7,
      firstName: 'Isaac',
      lastName: 'Aufderhar',
      middleName: null,
      email: 'Jedidiah_Lockman@Heidenreich.info',
      createdAt: '2022-06-28T20:31:26.536Z',
      updatedAt: '2022-06-28T20:31:26.537Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '7I5X5',
      dutyTitle: 'Totam id',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 7,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 30,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.104Z',
              completedDate: null,
              order: 7,
              traineeId: 7,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 7,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 31,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.153Z',
              completedDate: null,
              order: 9,
              traineeId: 7,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 7,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 32,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.198Z',
              completedDate: null,
              order: 7,
              traineeId: 7,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 7,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 33,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.265Z',
              completedDate: null,
              order: 5,
              traineeId: 7,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 7,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 34,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.319Z',
              completedDate: null,
              order: 6,
              traineeId: 7,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 12,
      firstName: 'Neha',
      lastName: 'Bayer',
      middleName: null,
      email: 'Brandi_Dickinson@Lauriane.ca',
      createdAt: '2022-06-28T20:31:26.572Z',
      updatedAt: '2022-06-28T20:31:26.572Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '6D2X7',
      dutyTitle: 'Aut animi cum',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 12,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 35,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.369Z',
              completedDate: null,
              order: 8,
              traineeId: 12,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 12,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 36,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.423Z',
              completedDate: null,
              order: 10,
              traineeId: 12,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 12,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 37,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.476Z',
              completedDate: null,
              order: 8,
              traineeId: 12,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 12,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 38,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.531Z',
              completedDate: null,
              order: 6,
              traineeId: 12,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 12,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 39,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.578Z',
              completedDate: null,
              order: 7,
              traineeId: 12,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 14,
      firstName: 'Zechariah',
      lastName: 'Block',
      middleName: null,
      email: 'Madie.Cummerata@Amira.us',
      createdAt: '2022-06-28T20:31:26.590Z',
      updatedAt: '2022-06-28T20:31:26.590Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '2W2X2',
      dutyTitle: 'Earum rem',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 14,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 40,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.627Z',
              completedDate: null,
              order: 9,
              traineeId: 14,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 14,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 41,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.679Z',
              completedDate: null,
              order: 11,
              traineeId: 14,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 14,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 42,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.727Z',
              completedDate: null,
              order: 9,
              traineeId: 14,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 14,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 43,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.776Z',
              completedDate: null,
              order: 7,
              traineeId: 14,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 14,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 44,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.824Z',
              completedDate: null,
              order: 8,
              traineeId: 14,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 8,
      firstName: 'Joshua',
      lastName: 'Borer',
      middleName: null,
      email: 'Dominic.Farrell@hotmail.com',
      createdAt: '2022-06-28T20:31:26.543Z',
      updatedAt: '2022-06-28T20:31:26.544Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '4N6X5',
      dutyTitle: 'Fugit vitae',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 8,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 45,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.871Z',
              completedDate: null,
              order: 10,
              traineeId: 8,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 8,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 46,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.925Z',
              completedDate: null,
              order: 12,
              traineeId: 8,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 8,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 47,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:47.974Z',
              completedDate: null,
              order: 10,
              traineeId: 8,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 8,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 48,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.019Z',
              completedDate: null,
              order: 8,
              traineeId: 8,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 8,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 49,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.069Z',
              completedDate: null,
              order: 9,
              traineeId: 8,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 15,
      firstName: 'Heber',
      lastName: 'Considine',
      middleName: null,
      email: 'Jessyca_Beer@Schumm.us',
      createdAt: '2022-06-28T20:31:26.599Z',
      updatedAt: '2022-06-28T20:31:26.600Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '3U1X5',
      dutyTitle: 'Commodi consequatur qui',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 15,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 50,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.120Z',
              completedDate: null,
              order: 11,
              traineeId: 15,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 15,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 51,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.171Z',
              completedDate: null,
              order: 13,
              traineeId: 15,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 15,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 52,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.222Z',
              completedDate: null,
              order: 11,
              traineeId: 15,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 15,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 53,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.290Z',
              completedDate: null,
              order: 9,
              traineeId: 15,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 15,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 54,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.344Z',
              completedDate: null,
              order: 10,
              traineeId: 15,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      firstName: 'Rae',
      lastName: 'Graham',
      middleName: null,
      email: 'Zemlak.Octavia@Gaylord.co.uk',
      createdAt: '2022-06-28T20:31:26.508Z',
      updatedAt: '2022-06-28T20:31:26.509Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '3P4X3',
      dutyTitle: 'Possimus dolor',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 3,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 10,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:52:32.789Z',
              completedDate: null,
              order: 2,
              traineeId: 3,
              trackingItemId: 2,
            },
          ],
        },
        {
          isActive: true,
          userId: 3,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 11,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:52:32.843Z',
              completedDate: null,
              order: 6,
              traineeId: 3,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 3,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 14,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:52:59.359Z',
              completedDate: null,
              order: 3,
              traineeId: 3,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 3,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 15,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:52:59.405Z',
              completedDate: null,
              order: 4,
              traineeId: 3,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 3,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 55,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.509Z',
              completedDate: null,
              order: 10,
              traineeId: 3,
              trackingItemId: 1,
            },
          ],
        },
      ],
    },
    {
      id: 6,
      firstName: 'Easter',
      lastName: 'Johns',
      middleName: null,
      email: 'Cory_Hegmann@Uriel.us',
      createdAt: '2022-06-28T20:31:26.529Z',
      updatedAt: '2022-06-28T20:31:26.530Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '3L2X4',
      dutyTitle: 'Aperiam error animi',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 6,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 56,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.603Z',
              completedDate: null,
              order: 12,
              traineeId: 6,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 6,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 57,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.656Z',
              completedDate: null,
              order: 14,
              traineeId: 6,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 6,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 58,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.706Z',
              completedDate: null,
              order: 12,
              traineeId: 6,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 6,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 59,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.757Z',
              completedDate: null,
              order: 11,
              traineeId: 6,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 6,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 60,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.809Z',
              completedDate: null,
              order: 11,
              traineeId: 6,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 4,
      firstName: 'Antone',
      lastName: 'Koelpin',
      middleName: null,
      email: 'Matt.Bernier@Mraz.co.uk',
      createdAt: '2022-06-28T20:31:26.515Z',
      updatedAt: '2022-06-28T20:31:26.516Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '6E4X2',
      dutyTitle: 'Sed sequi quo',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 4,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 61,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.859Z',
              completedDate: null,
              order: 13,
              traineeId: 4,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 4,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 62,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.911Z',
              completedDate: null,
              order: 15,
              traineeId: 4,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 4,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 63,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:48.962Z',
              completedDate: null,
              order: 13,
              traineeId: 4,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 4,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 64,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.012Z',
              completedDate: null,
              order: 12,
              traineeId: 4,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 4,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 65,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.061Z',
              completedDate: null,
              order: 12,
              traineeId: 4,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      firstName: 'Danial',
      lastName: 'Krajcik',
      middleName: null,
      email: 'Andres.Collins@yahoo.com',
      createdAt: '2022-06-28T20:31:26.501Z',
      updatedAt: '2022-06-28T20:31:26.501Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '1Y3X3',
      dutyTitle: 'Laboriosam eius',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 2,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 66,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.114Z',
              completedDate: null,
              order: 14,
              traineeId: 2,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 2,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 67,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.169Z',
              completedDate: null,
              order: 16,
              traineeId: 2,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 2,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 68,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.222Z',
              completedDate: null,
              order: 14,
              traineeId: 2,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 2,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 69,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.275Z',
              completedDate: null,
              order: 13,
              traineeId: 2,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 2,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 70,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.344Z',
              completedDate: null,
              order: 13,
              traineeId: 2,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 11,
      firstName: 'Bridgette',
      lastName: 'Lind',
      middleName: null,
      email: 'Nels.Kuhn@yahoo.com',
      createdAt: '2022-06-28T20:31:26.565Z',
      updatedAt: '2022-06-28T20:31:26.566Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '3Y2X6',
      dutyTitle: 'Dignissimos officiis',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 11,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 71,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.399Z',
              completedDate: null,
              order: 15,
              traineeId: 11,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 11,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 72,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.456Z',
              completedDate: null,
              order: 17,
              traineeId: 11,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 11,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 73,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.515Z',
              completedDate: null,
              order: 15,
              traineeId: 11,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 11,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 74,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.568Z',
              completedDate: null,
              order: 14,
              traineeId: 11,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 11,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 75,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.625Z',
              completedDate: null,
              order: 14,
              traineeId: 11,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 23,
      firstName: 'Sam',
      lastName: 'Member',
      middleName: null,
      email: 'sam.member@gmail.com',
      createdAt: '2022-06-28T20:31:26.661Z',
      updatedAt: '2022-06-28T20:31:26.662Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 4,
      rank: 'SSgt/E-5',
      afsc: '3I4X5',
      dutyTitle: 'Sint officiis aut',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 23,
          createdAt: '2022-06-28T20:31:26.720Z',
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 1,
              traineeSignedDate: '2022-06-26T20:31:26.746Z',
              authoritySignedDate: '2022-06-26T20:31:26.746Z',
              authorityId: 24,
              createdAt: '2022-06-28T20:31:26.747Z',
              completedDate: '2022-06-23T20:31:26.746Z',
              order: 2,
              traineeId: 23,
              trackingItemId: 3,
            },
            {
              id: 2,
              traineeSignedDate: '2022-06-26T20:31:26.767Z',
              authoritySignedDate: '2022-06-26T20:31:26.767Z',
              authorityId: 24,
              createdAt: '2022-06-28T20:31:26.768Z',
              completedDate: '2022-06-23T20:31:26.767Z',
              order: 1,
              traineeId: 23,
              trackingItemId: 3,
            },
            {
              id: 5,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:31:26.791Z',
              completedDate: null,
              order: 3,
              traineeId: 23,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 23,
          createdAt: '2022-06-28T20:31:26.734Z',
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 3,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:31:26.776Z',
              completedDate: null,
              order: 1,
              traineeId: 23,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 23,
          createdAt: '2022-06-28T20:31:26.740Z',
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 4,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:31:26.784Z',
              completedDate: null,
              order: 1,
              traineeId: 23,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 23,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 76,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.782Z',
              completedDate: null,
              order: 15,
              traineeId: 23,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 23,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 77,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.833Z',
              completedDate: null,
              order: 15,
              traineeId: 23,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 25,
      firstName: 'Scarlet',
      lastName: 'Member',
      middleName: null,
      email: 'scarlet.member@gmail.com',
      createdAt: '2022-06-28T20:31:26.711Z',
      updatedAt: '2022-06-28T20:31:26.712Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 2,
      rank: 'SSgt/E-5',
      afsc: '1J3X4',
      dutyTitle: 'Voluptatem blanditiis soluta',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 25,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 78,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.885Z',
              completedDate: null,
              order: 16,
              traineeId: 25,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 25,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 79,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.940Z',
              completedDate: null,
              order: 18,
              traineeId: 25,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 25,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 80,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:49.990Z',
              completedDate: null,
              order: 16,
              traineeId: 25,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 25,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 81,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.040Z',
              completedDate: null,
              order: 16,
              traineeId: 25,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 25,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 82,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.090Z',
              completedDate: null,
              order: 16,
              traineeId: 25,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 24,
      firstName: 'Frank',
      lastName: 'Monitor',
      middleName: null,
      email: 'frank.monitor@gmail.com',
      createdAt: '2022-06-28T20:31:26.700Z',
      updatedAt: '2022-06-28T20:31:26.701Z',
      lastLogin: null,
      roleId: 3,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '3H5X6',
      dutyTitle: 'Corrupti voluptatibus mollitia',
      role: {
        id: 3,
        name: 'monitor',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 24,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 83,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.135Z',
              completedDate: null,
              order: 17,
              traineeId: 24,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 24,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 84,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.179Z',
              completedDate: null,
              order: 19,
              traineeId: 24,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 24,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 85,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.224Z',
              completedDate: null,
              order: 17,
              traineeId: 24,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 24,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 86,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.269Z',
              completedDate: null,
              order: 17,
              traineeId: 24,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 24,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 87,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.318Z',
              completedDate: null,
              order: 17,
              traineeId: 24,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 10,
      firstName: 'Sonya',
      lastName: 'Murphy',
      middleName: null,
      email: 'Braeden_Schneider@yahoo.com',
      createdAt: '2022-06-28T20:31:26.558Z',
      updatedAt: '2022-06-28T20:31:26.558Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '5G3X2',
      dutyTitle: 'Et voluptates autem',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 10,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 88,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.382Z',
              completedDate: null,
              order: 18,
              traineeId: 10,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 10,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 89,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.435Z',
              completedDate: null,
              order: 20,
              traineeId: 10,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 10,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 90,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.488Z',
              completedDate: null,
              order: 18,
              traineeId: 10,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 10,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 91,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.546Z',
              completedDate: null,
              order: 18,
              traineeId: 10,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 10,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 92,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.674Z',
              completedDate: null,
              order: 18,
              traineeId: 10,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 5,
      firstName: 'Linnea',
      lastName: 'Oberbrunner',
      middleName: null,
      email: 'Krajcik.Maximillia@Crist.net',
      createdAt: '2022-06-28T20:31:26.522Z',
      updatedAt: '2022-06-28T20:31:26.523Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '6P4X4',
      dutyTitle: 'Pariatur odit laborum',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 5,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 93,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.723Z',
              completedDate: null,
              order: 19,
              traineeId: 5,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 5,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 94,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.769Z',
              completedDate: null,
              order: 21,
              traineeId: 5,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 5,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 95,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.814Z',
              completedDate: null,
              order: 19,
              traineeId: 5,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 5,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 96,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.864Z',
              completedDate: null,
              order: 19,
              traineeId: 5,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 5,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 97,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.914Z',
              completedDate: null,
              order: 19,
              traineeId: 5,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 17,
      firstName: 'Kayli',
      lastName: 'Price',
      middleName: null,
      email: 'Marlee.Bruen@Ayla.us',
      createdAt: '2022-06-28T20:31:26.616Z',
      updatedAt: '2022-06-28T20:31:26.617Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '5Z2X7',
      dutyTitle: 'Iure nobis',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 17,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 98,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:50.966Z',
              completedDate: null,
              order: 20,
              traineeId: 17,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 17,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 99,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.016Z',
              completedDate: null,
              order: 22,
              traineeId: 17,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 17,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 100,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.064Z',
              completedDate: null,
              order: 20,
              traineeId: 17,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 17,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 101,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.115Z',
              completedDate: null,
              order: 20,
              traineeId: 17,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 17,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 102,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.165Z',
              completedDate: null,
              order: 20,
              traineeId: 17,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 20,
      firstName: 'Jacquelyn',
      lastName: 'Schimmel',
      middleName: null,
      email: 'Muller.Marco@Jackie.ca',
      createdAt: '2022-06-28T20:31:26.640Z',
      updatedAt: '2022-06-28T20:31:26.641Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '5T1X4',
      dutyTitle: 'Dolor id',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 20,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 103,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.213Z',
              completedDate: null,
              order: 21,
              traineeId: 20,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 20,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 104,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.261Z',
              completedDate: null,
              order: 23,
              traineeId: 20,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 20,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 105,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.309Z',
              completedDate: null,
              order: 21,
              traineeId: 20,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 20,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 106,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.360Z',
              completedDate: null,
              order: 21,
              traineeId: 20,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 20,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 107,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.428Z',
              completedDate: null,
              order: 21,
              traineeId: 20,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 13,
      firstName: 'Nora',
      lastName: 'Schuppe',
      middleName: null,
      email: 'Wiza.Kyler@gmail.com',
      createdAt: '2022-06-28T20:31:26.581Z',
      updatedAt: '2022-06-28T20:31:26.581Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '4T6X4',
      dutyTitle: 'Repellat autem minus',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 13,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 108,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.485Z',
              completedDate: null,
              order: 22,
              traineeId: 13,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 13,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 109,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.542Z',
              completedDate: null,
              order: 24,
              traineeId: 13,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 13,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 110,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.596Z',
              completedDate: null,
              order: 22,
              traineeId: 13,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 13,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 111,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.650Z',
              completedDate: null,
              order: 22,
              traineeId: 13,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 13,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 112,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.705Z',
              completedDate: null,
              order: 22,
              traineeId: 13,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 21,
      firstName: 'Kelli',
      lastName: 'Sipes',
      middleName: null,
      email: 'Mike_Gulgowski@Greenholt.com',
      createdAt: '2022-06-28T20:31:26.648Z',
      updatedAt: '2022-06-28T20:31:26.648Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '7V7X5',
      dutyTitle: 'Nihil cupiditate',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 21,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 113,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.758Z',
              completedDate: null,
              order: 23,
              traineeId: 21,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 21,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 114,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.811Z',
              completedDate: null,
              order: 25,
              traineeId: 21,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 21,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 115,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.862Z',
              completedDate: null,
              order: 23,
              traineeId: 21,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 21,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 116,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.913Z',
              completedDate: null,
              order: 23,
              traineeId: 21,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 21,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 117,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:51.970Z',
              completedDate: null,
              order: 23,
              traineeId: 21,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 18,
      firstName: 'Bennie',
      lastName: 'Yundt',
      middleName: null,
      email: 'Eve_Brakus@Autumn.name',
      createdAt: '2022-06-28T20:31:26.625Z',
      updatedAt: '2022-06-28T20:31:26.625Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '5S3X1',
      dutyTitle: 'Quibusdam nobis',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 18,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 118,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:52.021Z',
              completedDate: null,
              order: 24,
              traineeId: 18,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 18,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 119,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:52.073Z',
              completedDate: null,
              order: 26,
              traineeId: 18,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 18,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 120,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:52.123Z',
              completedDate: null,
              order: 24,
              traineeId: 18,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 18,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 121,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:52.177Z',
              completedDate: null,
              order: 24,
              traineeId: 18,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 18,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 122,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:52.229Z',
              completedDate: null,
              order: 24,
              traineeId: 18,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 22,
      firstName: 'Lavada',
      lastName: 'Yundt',
      middleName: null,
      email: 'Winston.Altenwerth@Domenic.ca',
      createdAt: '2022-06-28T20:31:26.654Z',
      updatedAt: '2022-06-28T20:31:26.655Z',
      lastLogin: null,
      roleId: 2,
      organizationId: 1,
      rank: 'SSgt/E-5',
      afsc: '1J5X2',
      dutyTitle: 'Reiciendis adipisci maxime',
      role: {
        id: 2,
        name: 'member',
      },
      memberTrackingItems: [
        {
          isActive: true,
          userId: 22,
          createdAt: null,
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 180,
          },
          memberTrackingRecords: [
            {
              id: 123,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:52.275Z',
              completedDate: null,
              order: 25,
              traineeId: 22,
              trackingItemId: 5,
            },
          ],
        },
        {
          isActive: true,
          userId: 22,
          createdAt: null,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 90,
          },
          memberTrackingRecords: [
            {
              id: 124,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:52.324Z',
              completedDate: null,
              order: 27,
              traineeId: 22,
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: 22,
          createdAt: null,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 125,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:52.370Z',
              completedDate: null,
              order: 25,
              traineeId: 22,
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: 22,
          createdAt: null,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Extinguisher',
            description: 'This is a AF yearly requirment',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 126,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:52.425Z',
              completedDate: null,
              order: 25,
              traineeId: 22,
              trackingItemId: 1,
            },
          ],
        },
        {
          isActive: true,
          userId: 22,
          createdAt: null,
          trackingItemId: 2,
          trackingItem: {
            id: 2,
            title: 'Supervisor Safety Training',
            description: 'One time training for new supevisors',
            interval: 0,
          },
          memberTrackingRecords: [
            {
              id: 127,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2022-06-28T20:56:52.491Z',
              completedDate: null,
              order: 25,
              traineeId: 22,
              trackingItemId: 2,
            },
          ],
        },
      ],
    },
  ],
  dataUpdatedAt: 1656455709570,
  error: null,
  errorUpdatedAt: 0,
  failureCount: 0,
  errorUpdateCount: 0,
  isFetched: true,
  isFetchedAfterMount: true,
  isFetching: false,
  isRefetching: false,
  isLoadingError: false,
  isPlaceholderData: false,
  isPreviousData: false,
  isRefetchError: false,
  isStale: true,
} as unknown as UseQueryResult<UserWithAll[]>;

const testFailedJob = {
  id: 29,
  message: 'Started at \tTue, Jun 21, 2022 8:33 AM',
  progress: 1,
  status: JobStatus.COMPLETED,
  total: 1,
  url: '/api/jobs/29',
  startedById: 321,
  avgProcessingTime: null,
  results: [
    {
      id: 1,
      status: JobStatus.FAILED,
      success: false,
      message: 'This has failed',
      jobId: 29,
      forUserId: 1,
      forUser: { firstName: 'Joe', lastName: 'Admin', id: 1 },
      forTrackingItemId: 2,
      forTrackingItem: {
        id: 2,
        title: 'Fire Extinguisher',
        description: 'This is a test item',
        interval: 365,
      },
    },
    {
      id: 2,
      status: JobStatus.FAILED,
      success: false,
      message: 'This has failed',
      jobId: 29,
      forUserId: 1,
      forUser: { firstName: 'Joe', lastName: 'Admin', id: 1 },
      forTrackingItemId: 3,
      forTrackingItem: {
        id: 3,
        title: 'Fire Test',
        description: 'This is a test item',
        interval: 365,
      },
    },
    {
      id: 3,
      status: JobStatus.FAILED,
      success: false,
      message: 'This has failed',
      jobId: 29,
      forUserId: 3,
      forUser: { firstName: 'Bob', lastName: 'Sanders', id: 3 },
      forTrackingItemId: 3,
      forTrackingItem: {
        id: 3,
        title: 'Fire Test',
        description: 'This is a test item',
        interval: 365,
      },
    },
    {
      id: 4,
      status: JobStatus.FAILED,
      success: false,
      message: 'This has failed',
      jobId: 29,
      forUserId: 3,
      forUser: { firstName: 'Bob', lastName: 'Sanders', id: 3 },
      forTrackingItemId: 4,
      forTrackingItem: {
        id: 4,
        title: 'Fire Test 2',
        description: 'This is a test item',
        interval: 365,
      },
    },
    {
      id: 5,
      status: JobStatus.FAILED,
      success: false,
      message: 'This has failed',
      jobId: 29,
      forUserId: 3,
      forUser: { firstName: 'Bob', lastName: 'Sanders', id: 3 },
      forTrackingItemId: 5,
      forTrackingItem: {
        id: 5,
        title: 'Fire Test 3',
        description: 'This is a test item',
        interval: 365,
      },
    },
    {
      id: 2,
      status: JobStatus.FAILED,
      success: false,
      message: 'This has failed',
      jobId: 29,
      forUserId: 3,
      forUser: { firstName: 'Bob', lastName: 'Sanders', id: 3 },
      forTrackingItemId: 7,
      forTrackingItem: {
        id: 7,
        title: 'Fire Test 4',
        description: 'This is a test item',
        interval: 365,
      },
    },
  ],
};

test('should display Mass Assign Feature and navigate forward and back through steps', async () => {
  const screen = render(<MassAssign usersQuery={usersQuery} />);

  const BigBugSafetyCheckBox = await screen.findByText(/big bug safety/i);

  const trackingItemsNextButton = screen.getByRole('button', { name: 'tracking-items-next-button' });
  expect(trackingItemsNextButton).toBeDisabled();

  fireEvent.click(BigBugSafetyCheckBox);

  expect(trackingItemsNextButton).not.toBeDisabled();

  fireEvent.click(trackingItemsNextButton);

  const usersNextButton = screen.getByRole('button', { name: 'users-next-button' });
  expect(usersNextButton).toBeDisabled();

  const usersBackButton = screen.getByRole('button', { name: 'users-back-button' });
  fireEvent.click(usersBackButton);
  expect(screen.getByText(/recurrence/i)).toBeInTheDocument();

  const trackingItemsNextButton2 = screen.getByRole('button', { name: 'tracking-items-next-button' });

  fireEvent.click(trackingItemsNextButton2);
  const usersNextButton2 = screen.getByRole('button', { name: 'users-next-button' });

  const joeAdminCheckBox = screen.getByText(/joe admin/i);
  fireEvent.click(joeAdminCheckBox);
  expect(usersNextButton2).not.toBeDisabled();

  fireEvent.click(usersNextButton2);

  expect(screen.getByText(/selected member/i)).toBeInTheDocument();
  expect(screen.getByText(/selected training/i)).toBeInTheDocument();
  expect(screen.getByText(/joe admin/i)).toBeInTheDocument();
  expect(screen.getByText(/big bug safety/i)).toBeInTheDocument();

  const reviewBackButton = screen.getByRole('button', { name: 'review-back-button' });
  fireEvent.click(reviewBackButton);
});

test('should check all in tracking item select and filter', async () => {
  const screen = render(<MassAssign usersQuery={usersQuery} />);

  await screen.findByText(/big bug safety/i);
  const allCheckBox = screen.getByText(/item/i);

  fireEvent.click(allCheckBox);

  const fireExtinguisherCheckBox = screen.getByRole('checkbox', {
    name: /fire extinguisher annually/i,
  });
  expect(fireExtinguisherCheckBox).toBeChecked();

  fireEvent.click(allCheckBox);

  expect(fireExtinguisherCheckBox).not.toBeChecked();

  fireEvent.click(allCheckBox);

  const fireSafetyCheckBox = screen.getByRole('checkbox', {
    name: /fire safety/i,
  });

  fireEvent.click(fireSafetyCheckBox);

  expect(fireSafetyCheckBox).not.toBeChecked();

  const searchBox = screen.getByRole('textbox');

  fireEvent.change(searchBox, { target: { value: 'big' } });

  expect(screen.getByText(/big bug safety/i)).toBeInTheDocument();
  expect(screen.queryByText(/fire safety/i)).not.toBeInTheDocument();
});

test('should check all in user item select and filter', async () => {
  const screen = render(<MassAssign usersQuery={usersQuery} />);

  await screen.findByText(/big bug safety/i);
  const allItemCheckBox = screen.getByText(/item/i);

  fireEvent.click(allItemCheckBox);

  const trackingItemsNextButton = screen.getByRole('button', { name: 'tracking-items-next-button' });
  fireEvent.click(trackingItemsNextButton);

  const allUserCheckBox = screen.getByText(/name/i);

  fireEvent.click(allUserCheckBox);

  const joeAdminCheckBox = screen.getByRole('checkbox', {
    name: /joe admin/i,
  });
  expect(joeAdminCheckBox).toBeChecked();

  fireEvent.click(allUserCheckBox);

  expect(joeAdminCheckBox).not.toBeChecked();

  fireEvent.click(allUserCheckBox);

  const edmondCheckBox = screen.getByRole('checkbox', {
    name: /edmond adams/i,
  });

  fireEvent.click(edmondCheckBox);

  expect(edmondCheckBox).not.toBeChecked();

  const searchBox = screen.getByRole('textbox');

  fireEvent.change(searchBox, { target: { value: 'joe' } });

  expect(screen.getByText(/joe admin/i)).toBeInTheDocument();
  expect(screen.queryByText(/edmond adams/i)).not.toBeInTheDocument();
});

test('should be able to remove users and/or tracking items on review page', async () => {
  const screen = render(<MassAssign usersQuery={usersQuery} />);

  await screen.findByText(/big bug safety/i);
  const allItemCheckBox = screen.getByText(/item/i);

  fireEvent.click(allItemCheckBox);

  const trackingItemsNextButton = screen.getByRole('button', { name: 'tracking-items-next-button' });
  fireEvent.click(trackingItemsNextButton);

  const allUserCheckBox = screen.getByText(/name/i);

  fireEvent.click(allUserCheckBox);

  const usersNextButton = screen.getByRole('button', { name: 'users-next-button' });

  fireEvent.click(usersNextButton);

  expect(screen.getByText(/joe admin/i)).toBeInTheDocument();
  expect(screen.getByText(/big bug safety/i)).toBeInTheDocument();

  const deleteBigBug = screen.getByRole('button', {
    name: /delete-trackingitem-4/i,
  });

  const edmondDelete = screen.getByRole('button', {
    name: 'delete-user-1',
  });

  fireEvent.click(deleteBigBug);
  fireEvent.click(edmondDelete);

  expect(screen.queryByText(/joe admin/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/big bug safety/i)).not.toBeInTheDocument();
});

test('should display Mass assign result dialog after assign', async () => {
  const screen = render(<MassAssign usersQuery={usersQuery} />);

  const BigBugSafetyCheckBox = await screen.findByText(/big bug safety/i);

  const trackingItemsNextButton = screen.getByRole('button', { name: 'tracking-items-next-button' });
  fireEvent.click(BigBugSafetyCheckBox);
  fireEvent.click(trackingItemsNextButton);

  const usersNextButton = screen.getByRole('button', { name: 'users-next-button' });

  const joeAdminCheckBox = screen.getByText(/joe admin/i);
  fireEvent.click(joeAdminCheckBox);

  fireEvent.click(usersNextButton);

  expect(screen.getByText(/joe admin/i)).toBeInTheDocument();
  expect(screen.getByText(/big bug safety/i)).toBeInTheDocument();

  const assignButton = screen.getByRole('button', { name: /assign/i });

  fireEvent.click(assignButton);

  expect(await screen.findByRole('heading', { name: /success/i })).toBeInTheDocument();
});

test('mass assign result should show in progress', async () => {
  server.use(
    rest.get(EUri.JOBS + '14', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(createJson));
    })
  );
  const screen = render(<MassAssign usersQuery={usersQuery} />);

  const BigBugSafetyCheckBox = await screen.findByText(/big bug safety/i);

  const trackingItemsNextButton = screen.getByRole('button', { name: 'tracking-items-next-button' });
  fireEvent.click(BigBugSafetyCheckBox);
  fireEvent.click(trackingItemsNextButton);

  const usersNextButton = screen.getByRole('button', { name: 'users-next-button' });

  const joeAdminCheckBox = screen.getByText(/joe admin/i);
  fireEvent.click(joeAdminCheckBox);

  fireEvent.click(usersNextButton);

  expect(screen.getByText(/joe admin/i)).toBeInTheDocument();
  expect(screen.getByText(/big bug safety/i)).toBeInTheDocument();

  const assignButton = screen.getByRole('button', { name: /assign/i });

  fireEvent.click(assignButton);

  expect(await screen.findByText(/calculating estimated time/i)).toBeInTheDocument();
});

test('mass assign result should show in progress and calculate estimated time remaining', async () => {
  server.use(
    rest.get(EUri.JOBS + '14', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(progressJson));
    })
  );
  const screen = render(<MassAssign usersQuery={usersQuery} />);

  const BigBugSafetyCheckBox = await screen.findByText(/big bug safety/i);

  const trackingItemsNextButton = screen.getByRole('button', { name: 'tracking-items-next-button' });
  fireEvent.click(BigBugSafetyCheckBox);
  fireEvent.click(trackingItemsNextButton);

  const usersNextButton = screen.getByRole('button', { name: 'users-next-button' });

  const joeAdminCheckBox = screen.getByText(/joe admin/i);
  fireEvent.click(joeAdminCheckBox);

  fireEvent.click(usersNextButton);

  expect(screen.getByText(/joe admin/i)).toBeInTheDocument();
  expect(screen.getByText(/big bug safety/i)).toBeInTheDocument();

  const assignButton = screen.getByRole('button', { name: /assign/i });

  fireEvent.click(assignButton);

  expect(await screen.findByText(/estimated time/i)).toBeInTheDocument();
});

test('mass assign result should show members and items that failed to assign', async () => {
  server.use(
    rest.get(EUri.JOBS + '14', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(testFailedJob));
    })
  );
  const screen = render(<MassAssign usersQuery={usersQuery} />);

  const BigBugSafetyCheckBox = await screen.findByText(/big bug safety/i);

  const trackingItemsNextButton = screen.getByRole('button', { name: 'tracking-items-next-button' });
  fireEvent.click(BigBugSafetyCheckBox);
  fireEvent.click(trackingItemsNextButton);

  const usersNextButton = screen.getByRole('button', { name: 'users-next-button' });

  const joeAdminCheckBox = screen.getByText(/joe admin/i);
  fireEvent.click(joeAdminCheckBox);

  fireEvent.click(usersNextButton);

  expect(screen.getByText(/joe admin/i)).toBeInTheDocument();
  expect(screen.getByText(/big bug safety/i)).toBeInTheDocument();

  const assignButton = screen.getByRole('button', { name: /assign/i });

  fireEvent.click(assignButton);

  expect(await screen.findByText(/failed to assign/i)).toBeInTheDocument();
});

test('mass assign result should close dialog and reset form', async () => {
  server.use(
    rest.get(EUri.JOBS + '14', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(testFailedJob));
    })
  );
  const screen = render(<MassAssign usersQuery={usersQuery} />);

  const BigBugSafetyCheckBox = await screen.findByText(/big bug safety/i);

  const trackingItemsNextButton = screen.getByRole('button', { name: 'tracking-items-next-button' });
  fireEvent.click(BigBugSafetyCheckBox);
  fireEvent.click(trackingItemsNextButton);

  const usersNextButton = screen.getByRole('button', { name: 'users-next-button' });

  const joeAdminCheckBox = screen.getByText(/joe admin/i);
  fireEvent.click(joeAdminCheckBox);

  fireEvent.click(usersNextButton);

  expect(screen.getByText(/joe admin/i)).toBeInTheDocument();
  expect(screen.getByText(/big bug safety/i)).toBeInTheDocument();

  const assignButton = screen.getByRole('button', { name: /assign/i });

  fireEvent.click(assignButton);

  expect(await screen.findByText(/failed to assign/i)).toBeInTheDocument();

  userEvent.keyboard('{esc}');

  await screen.findByText(/assign training/i);
  expect(screen.queryByText(/failed to assign/i)).not.toBeInTheDocument();
});

test('mass assign result should close dialog and select retry members and tracking items', async () => {
  server.use(
    rest.get(EUri.JOBS + '14', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(testFailedJob));
    })
  );
  const screen = render(<MassAssign usersQuery={usersQuery} />);

  const BigBugSafetyCheckBox = await screen.findByText(/big bug safety/i);

  const trackingItemsNextButton = screen.getByRole('button', { name: 'tracking-items-next-button' });
  fireEvent.click(BigBugSafetyCheckBox);
  fireEvent.click(trackingItemsNextButton);

  const usersNextButton = screen.getByRole('button', { name: 'users-next-button' });

  const joeAdminCheckBox = screen.getByText(/joe admin/i);
  fireEvent.click(joeAdminCheckBox);

  fireEvent.click(usersNextButton);

  expect(screen.getByText(/joe admin/i)).toBeInTheDocument();
  expect(screen.getByText(/big bug safety/i)).toBeInTheDocument();

  const assignButton = screen.getByRole('button', { name: /assign/i });

  fireEvent.click(assignButton);

  expect(await screen.findByText(/failed to assign/i)).toBeInTheDocument();

  const retryButton = screen.getByRole('button', { name: /retry/i });
  fireEvent.click(retryButton);

  await screen.findByText(/selected member/i);
  await screen.findByText(/selected training/i);
});
