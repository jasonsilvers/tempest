import {
  fireEvent,
  render,
  waitFor,
  waitForElementToBeRemoved,
  waitForLoadingToFinish,
} from '../../testutils/TempestTestUtils';
import React from 'react';
import MemberItemTracker from '../../../src/components/Records/MemberRecordTracker/MemberItemTracker';
import { rest } from 'msw';
import dayjs from 'dayjs';
import { TrackingItem } from '.prisma/client';
import { User } from '@prisma/client';
import { server } from '../../testutils/mocks/msw';
import Tab from '../../../src/components/Records/MemberRecordTracker/Tab';
import { ECategories, EMtrVariant, EUri } from '../../../src/const/enums';

import 'whatwg-fetch';

// Establish API mocking before tests.
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

const testTrainee: Partial<User> = {
  id: 123,
  firstName: 'bob',
  lastName: 'jones',
  rank: 'SSgt/E-5',
};

const testAuthority: Partial<User> = {
  id: 321,
  firstName: 'mark',
  lastName: 'twain',
  rank: 'TSgt/E-6',
};

const fireSafetyItem: TrackingItem = {
  id: 1,
  title: 'Fire Safety',
  interval: 365,
  description: 'how to be safe with fire',
};

// use Member tracking items
const memberTrackingItemsGet = (user, memberTrackingItems, variant) =>
  rest.get(EUri.USERS + `${user.id}/membertrackingitems/${variant}`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ ...user, memberTrackingItems }));
  });

test('should render a record requiring signature - authority signed', async () => {
  const memberTrackingItems_authSigned = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: '123',
      trackingItem: fireSafetyItem,
      user: testTrainee as User,
      memberTrackingRecords: [
        {
          id: 1,
          order: 0,
          createdAt: dayjs().toDate(),
          trackingItemId: 1,
          trackingItem: fireSafetyItem,
          traineeId: '123',
          authorityId: '321',
          authoritySignedDate: dayjs().toDate(),
          completedDate: dayjs().toDate(),
          traineeSignedDate: null,
          trainee: testTrainee as User,
          authority: testAuthority as User,
        },
      ],
    },
  ];

  server.use(memberTrackingItemsGet(testTrainee, memberTrackingItems_authSigned, EMtrVariant.IN_PROGRESS));

  const { getByText, getByRole } = render(
    <MemberItemTracker userId={testTrainee.id} variant={EMtrVariant.IN_PROGRESS}>
      <Tab category={ECategories.ALL}>All</Tab>
      <Tab category={ECategories.UPCOMING}>Upcoming</Tab>
      <Tab category={ECategories.OVERDUE}>Overdue</Tab>
      <Tab category={ECategories.SIGNATURE_REQUIRED}>Awaiting Signature</Tab>
    </MemberItemTracker>
  );

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  const fire = await waitFor(() => getByText(/fire/i));
  const signatureTab = getByRole('awaiting_signature_tab');

  expect(fire).toBeInTheDocument();
  fireEvent.click(signatureTab);

  expect(fire).toBeInTheDocument();
});

test('should render a record requiring signature - trainee signed', async () => {
  const memberTrackingItems_traineeSigned = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: testTrainee.id,
      trackingItem: fireSafetyItem,
      user: testTrainee as User,
      memberTrackingRecords: [
        {
          id: 2,
          order: 0,
          trackingItemId: 1,
          trackingItem: fireSafetyItem,
          traineeId: '123',
          authorityId: '321',
          authoritySignedDate: null,
          completedDate: dayjs().toDate(),
          traineeSignedDate: dayjs().toDate(),
          trainee: testTrainee as User,
          authority: null,
        },
      ],
    },
  ];

  server.use(memberTrackingItemsGet(testTrainee, memberTrackingItems_traineeSigned, EMtrVariant.IN_PROGRESS));

  const { getByText, getByRole } = render(
    <MemberItemTracker userId={testTrainee.id} variant={EMtrVariant.IN_PROGRESS}>
      <Tab category={ECategories.ALL}>All</Tab>
      <Tab category={ECategories.UPCOMING}>Upcoming</Tab>
      <Tab category={ECategories.OVERDUE}>Overdue</Tab>
      <Tab category={ECategories.SIGNATURE_REQUIRED}>Awaiting Signature</Tab>
    </MemberItemTracker>
  );

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  const fire = await waitFor(() => getByText(/fire/i));
  const signatureTab = getByRole('awaiting_signature_tab');

  expect(fire).toBeInTheDocument();
  fireEvent.click(signatureTab);
  expect(fire).toBeInTheDocument();
});

test('should render a record that is done', async () => {
  const memberTrackingItems_done = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: testTrainee.id,
      trackingItem: fireSafetyItem,
      user: testTrainee as User,
      memberTrackingRecords: [
        {
          id: 3,
          order: 0,
          trackingItemId: 1,
          trackingItem: fireSafetyItem,
          traineeId: '123',
          authorityId: '321',
          authoritySignedDate: dayjs().toDate(),
          completedDate: dayjs().toDate(),
          traineeSignedDate: dayjs().toDate(),
          trainee: testTrainee as User,
          authority: testAuthority as User,
        },
      ],
    },
  ];

  server.use(memberTrackingItemsGet(testTrainee, memberTrackingItems_done, EMtrVariant.COMPLETED));

  const { getByText } = render(
    <MemberItemTracker userId={testTrainee.id} variant={EMtrVariant.COMPLETED}>
      <Tab category={ECategories.ALL}>All</Tab>
      <Tab category={ECategories.UPCOMING}>Upcoming</Tab>
      <Tab category={ECategories.OVERDUE}>Overdue</Tab>
      <Tab category={ECategories.DONE}>Done</Tab>
    </MemberItemTracker>
  );

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());

  const fire = await waitFor(() => getByText(/fire/i));
  const doneTab = getByText(/done/i);
  const overdue = getByText(/overdue/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(doneTab);
  expect(fire).toBeInTheDocument();
  fireEvent.click(overdue);
  expect(fire).not.toBeInTheDocument();
});

test('should render a record that is coming due', async () => {
  const memberTrackingItems_upcoming = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: testTrainee.id,
      trackingItem: fireSafetyItem,
      user: testTrainee as User,
      memberTrackingRecords: [
        {
          id: 3,
          order: 0,
          trackingItemId: 1,
          trackingItem: fireSafetyItem,
          traineeId: '123',
          authorityId: '321',
          authoritySignedDate: dayjs().toDate(),
          completedDate: dayjs()
            .subtract(365 - 10, 'days')
            .toDate(),
          traineeSignedDate: dayjs().toDate(),
          trainee: testTrainee as User,
          authority: testAuthority as User,
        },
      ],
    },
  ];

  server.use(memberTrackingItemsGet(testTrainee, memberTrackingItems_upcoming, EMtrVariant.COMPLETED));

  const { getByText } = render(
    <MemberItemTracker userId={testTrainee.id} variant={EMtrVariant.COMPLETED}>
      <Tab category={ECategories.ALL}>All</Tab>
      <Tab category={ECategories.UPCOMING}>Upcoming</Tab>
      <Tab category={ECategories.OVERDUE}>Overdue</Tab>
    </MemberItemTracker>
  );

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());

  const fire = await waitFor(() => getByText(/fire/i));
  const upcomingTab = getByText(/upcoming/i);
  const overdue = getByText(/overdue/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(upcomingTab);
  expect(fire).toBeInTheDocument();
  fireEvent.click(overdue);
  expect(fire).not.toBeInTheDocument();
});

test('should render a record that is overdue', async () => {
  const memberTrackingItems_upcoming = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: testTrainee.id,
      trackingItem: fireSafetyItem,
      user: testTrainee as User,
      memberTrackingRecords: [
        {
          id: 3,
          order: 0,
          trackingItemId: 1,
          trackingItem: fireSafetyItem,
          traineeId: '123',
          authorityId: '321',
          authoritySignedDate: dayjs().toDate(),
          completedDate: dayjs().subtract(366, 'days').toDate(),
          traineeSignedDate: dayjs().toDate(),
          trainee: testTrainee as User,
          authority: testAuthority as User,
        },
      ],
    },
  ];

  server.use(memberTrackingItemsGet(testTrainee, memberTrackingItems_upcoming, EMtrVariant.COMPLETED));

  const { getByText } = render(
    <MemberItemTracker userId={testTrainee.id} variant={EMtrVariant.COMPLETED}>
      <Tab category={ECategories.ALL}>All</Tab>
      <Tab category={ECategories.UPCOMING}>Upcoming</Tab>
      <Tab category={ECategories.OVERDUE}>Overdue</Tab>
    </MemberItemTracker>
  );

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());

  const fire = await waitFor(() => getByText(/fire/i));
  const overdueTab = getByText(/overdue/i);
  const upcomingTab = getByText(/upcoming/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(overdueTab);
  expect(fire).toBeInTheDocument();
  fireEvent.click(upcomingTab);
  expect(fire).not.toBeInTheDocument();
});

test('should sign record as trainee and mark as done', async () => {
  const memberTrackingItems_upcoming = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: testTrainee.id,
      trackingItem: fireSafetyItem,
      user: testTrainee as User,
      memberTrackingRecords: [
        {
          id: 3,
          order: 0,
          trackingItemId: 1,
          trackingItem: fireSafetyItem,
          traineeId: 123,
          authorityId: 321,
          authoritySignedDate: dayjs().toDate(),
          completedDate: dayjs().toDate(),
          traineeSignedDate: null,
          trainee: testTrainee as User,
          authority: testAuthority as User,
        },
      ],
    },
  ];

  const memberTrackingItems_Done = [
    {
      ...memberTrackingItems_upcoming[0],
      memberTrackingRecords: [
        { ...memberTrackingItems_upcoming[0].memberTrackingRecords[0], traineeSignedDate: dayjs().toDate() },
      ],
    },
  ];

  server.use(memberTrackingItemsGet(testTrainee, memberTrackingItems_upcoming, EMtrVariant.IN_PROGRESS));

  const { getByText, getByRole, queryByText } = render(
    <MemberItemTracker userId={testTrainee.id} variant={EMtrVariant.IN_PROGRESS}>
      <Tab category={ECategories.ALL}>All</Tab>
      <Tab category={ECategories.UPCOMING}>Upcoming</Tab>
      <Tab category={ECategories.OVERDUE}>Overdue</Tab>
      <Tab category={ECategories.DONE}>Done</Tab>
      <Tab category={ECategories.SIGNATURE_REQUIRED}>Awaiting Signature</Tab>
    </MemberItemTracker>
  );

  await waitFor(() => getByText(/fire/i));
  await waitForLoadingToFinish();

  expect(getByText(/signed on/i)).toBeInTheDocument();
  const signatureButton = getByRole('button', { name: 'signature_button' });

  server.use(
    memberTrackingItemsGet(testTrainee, memberTrackingItems_Done, EMtrVariant.IN_PROGRESS),

    rest.post(EUri.MEMBER_TRACKING_RECORDS + '*', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: 3,
          order: 0,
          trackingItemId: 1,
          traineeId: 123,
          authorityId: 321,
          authoritySignedDate: dayjs().toDate(),
          completedDate: dayjs().toDate(),
          traineeSignedDate: dayjs().toDate(),
          trainee: testTrainee as User,
          authority: testAuthority as User,
        })
      );
    })
  );

  fireEvent.click(signatureButton);
  await waitForElementToBeRemoved(() => getByRole('button', { name: 'signature_button' }));

  const doneTab = getByText(/done/i);

  fireEvent.click(doneTab);
  const fire = queryByText(/fire/i);

  expect(fire).toBeInTheDocument();
});
