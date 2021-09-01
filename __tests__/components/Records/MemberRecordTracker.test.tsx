import { fireEvent, render, waitFor, waitForElementToBeRemoved } from '../../utils/TempestTestUtils';
import React from 'react';
import MemberRecordTracker from '../../../src/components/Records/MemberRecordTracker/MemberRecordTracker';
import { rest } from 'msw';
import dayjs from 'dayjs';
import { TrackingItem } from '.prisma/client';
import { User } from '@prisma/client';
import { server } from '../../utils/mocks/msw';
import Tab from '../../../src/components/Records/MemberRecordTracker/Tab';
import { ECategories, EUri } from '../../../src/types/global';

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
  id: '123',
  firstName: 'bob',
  lastName: 'jones',
  rank: 'SSgt/E-5',
};

const testAuthority: Partial<User> = {
  id: '321',
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
const memberTrackingItemsGet = (user, memberTrackingItems) =>
  rest.get(EUri.USERS + `${user.id}/membertrackingitems`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ ...user, memberTrackingItems }));
  });
// use member tracking item single
const memberTrackingItemGet = (memberTrackingItem) =>
  rest.get(EUri.MEMBER_TRACKING_ITEMS, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(memberTrackingItem));
  });
// use member tracking record
const memberTrackingRecordGet = (memberTrackingRecord) =>
  rest.get(EUri.MEMBER_TRACKING_RECORDS + memberTrackingRecord.id, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(memberTrackingRecord));
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

  server.use(
    memberTrackingItemsGet(testTrainee, memberTrackingItems_authSigned),
    memberTrackingItemGet(memberTrackingItems_authSigned[0]),
    memberTrackingRecordGet(memberTrackingItems_authSigned[0].memberTrackingRecords[0])
  );

  const { getByText, getByRole } = render(
    <MemberRecordTracker userId={testTrainee.id} title="Test Records">
      <Tab category={ECategories.ALL}>All</Tab>
      <Tab category={ECategories.UPCOMING}>Upcoming</Tab>
      <Tab category={ECategories.OVERDUE}>Overdue</Tab>
      <Tab category={ECategories.SIGNATURE_REQUIRED}>Awaiting Signature</Tab>
    </MemberRecordTracker>
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

  server.use(
    memberTrackingItemsGet(testTrainee, memberTrackingItems_traineeSigned),
    memberTrackingItemGet(memberTrackingItems_traineeSigned[0]),
    memberTrackingRecordGet(memberTrackingItems_traineeSigned[0].memberTrackingRecords[0])
  );

  const { getByText, getByRole } = render(
    <MemberRecordTracker userId={testTrainee.id} title="Test Records">
      <Tab category={ECategories.ALL}>All</Tab>
      <Tab category={ECategories.UPCOMING}>Upcoming</Tab>
      <Tab category={ECategories.OVERDUE}>Overdue</Tab>
      <Tab category={ECategories.SIGNATURE_REQUIRED}>Awaiting Signature</Tab>
    </MemberRecordTracker>
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

  server.use(
    memberTrackingItemsGet(testTrainee, memberTrackingItems_done),
    memberTrackingItemGet(memberTrackingItems_done[0]),
    memberTrackingRecordGet(memberTrackingItems_done[0].memberTrackingRecords[0])
  );

  const { getByText } = render(
    <MemberRecordTracker userId={testTrainee.id} title="Test Records">
      <Tab category={ECategories.ALL}>All</Tab>
      <Tab category={ECategories.UPCOMING}>Upcoming</Tab>
      <Tab category={ECategories.OVERDUE}>Overdue</Tab>
      <Tab category={ECategories.DONE}>Done</Tab>
    </MemberRecordTracker>
  );

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());

  const fire = await waitFor(() => getByText(/fire/i));
  const doneTab = getByText(/done/i);
  const overdue = getByText(/over/i);

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

  server.use(
    memberTrackingItemsGet(testTrainee, memberTrackingItems_upcoming),
    memberTrackingItemGet(memberTrackingItems_upcoming[0]),
    memberTrackingRecordGet(memberTrackingItems_upcoming[0].memberTrackingRecords[0])
  );

  const { getByText } = render(
    <MemberRecordTracker userId={testTrainee.id} title="Test Records">
      <Tab category={ECategories.ALL}>All</Tab>
      <Tab category={ECategories.UPCOMING}>Upcoming</Tab>
      <Tab category={ECategories.OVERDUE}>Overdue</Tab>
    </MemberRecordTracker>
  );

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());

  const fire = await waitFor(() => getByText(/fire/i));
  const upcomingTab = getByText(/upcoming/i);
  const overdue = getByText(/over/i);

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

  server.use(
    memberTrackingItemsGet(testTrainee, memberTrackingItems_upcoming),
    memberTrackingItemGet(memberTrackingItems_upcoming[0]),
    memberTrackingRecordGet(memberTrackingItems_upcoming[0].memberTrackingRecords[0])
  );

  const { getByText } = render(
    <MemberRecordTracker userId={testTrainee.id} title="Test Records">
      <Tab category={ECategories.ALL}>All</Tab>
      <Tab category={ECategories.UPCOMING}>Upcoming</Tab>
      <Tab category={ECategories.OVERDUE}>Overdue</Tab>
    </MemberRecordTracker>
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

  const memberTrackingItems_Done = [
    {
      ...memberTrackingItems_upcoming[0],
      memberTrackingRecords: [
        { ...memberTrackingItems_upcoming[0].memberTrackingRecords[0], traineeSignedDate: dayjs().toDate() },
      ],
    },
  ];

  server.use(
    memberTrackingItemsGet(testTrainee, memberTrackingItems_upcoming),
    memberTrackingItemGet(memberTrackingItems_upcoming[0]),
    memberTrackingRecordGet(memberTrackingItems_upcoming[0].memberTrackingRecords[0])
  );

  const { getByText, getByRole, queryByText } = render(
    <MemberRecordTracker userId={testTrainee.id} title="Test Records">
      <Tab category={ECategories.ALL}>All</Tab>
      <Tab category={ECategories.UPCOMING}>Upcoming</Tab>
      <Tab category={ECategories.OVERDUE}>Overdue</Tab>
      <Tab category={ECategories.DONE}>Done</Tab>
      <Tab category={ECategories.SIGNATURE_REQUIRED}>Awaiting Signature</Tab>
    </MemberRecordTracker>
  );

  await waitFor(() => getByText(/fire/i));
  await waitFor(() => getByText(/completed/i));
  expect(getByText(/signed on/i)).toBeInTheDocument()
  const signatureButton = getByRole('button', { name: 'signature_button' });

  server.use(
    memberTrackingItemsGet(testTrainee, memberTrackingItems_Done),
    memberTrackingItemGet(memberTrackingItems_Done[0]),
    memberTrackingRecordGet(memberTrackingItems_Done[0].memberTrackingRecords[0]),
    rest.post(EUri.MEMBER_TRACKING_RECORDS + '*', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: 3,
          order: 0,
          trackingItemId: 1,
          traineeId: '123',
          authorityId: '321',
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
