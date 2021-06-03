import { fireEvent, render, waitFor, waitForElementToBeRemoved } from '../../utils/TempestTestUtils';
import React from 'react';
import MemberRecordTracker from '../../../src/components/Records/MemberRecordTracker';
import { rest } from 'msw';
import dayjs from 'dayjs';
import 'whatwg-fetch';
import { MemberTrackingItemWithAll } from '../../../src/repositories/memberTrackingRepo';
import { TrackingItem } from '.prisma/client';
import { User } from '@prisma/client';
import { server } from '../../utils/mocks/msw';

const testUser: Partial<User> = {
  id: '123',
  firstName: 'bob',
  lastName: 'jones',
};

const fireSafetyItem: TrackingItem = {
  id: 1,
  title: 'Fire Safety',
  interval: 365,
  description: 'how to be safe with fire',
};

// use Member tracking items
const memberTrackingItemsGet = (user, memberTrackingItems) =>
  rest.get(`/api/users/${user.id}/membertrackingitems`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ ...user, memberTrackingItems }));
  });
// use member tracking item single
const memberTrackingItemGet = (memberTrackingItem) =>
  rest.get(`/api/membertrackingitems`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(memberTrackingItem));
  });
// use member tracking record
const memberTrackingRecordGet = (memberTrackingRecord) =>
  rest.get(`/api/membertrackingrecords/${memberTrackingRecord.id}`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(memberTrackingRecord));
  });

test('should render a record requiring signature - authority signed', async () => {
  const memberTrackingItems_authSigned: MemberTrackingItemWithAll[] = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: '123',
      trackingItem: fireSafetyItem,
      user: testUser as User,
      memberTrackingRecords: [
        {
          id: 1,
          order: 0,
          trackingItemId: 1,
          trackingItem: fireSafetyItem,
          traineeId: '123',
          authorityId: '321',
          authoritySignedDate: dayjs().toDate(),
          completedDate: dayjs().toDate(),
          traineeSignedDate: null,
          trainee: null,
          authority: null,
        },
      ],
    },
  ];

  server.use(
    memberTrackingItemsGet(testUser, memberTrackingItems_authSigned),
    memberTrackingItemGet(memberTrackingItems_authSigned[0]),
    memberTrackingRecordGet(memberTrackingItems_authSigned[0].memberTrackingRecords[0])
  );

  const { getByText } = render(<MemberRecordTracker userId={testUser.id} />);

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  const fire = await waitFor(() => getByText(/fire/i));
  const signatureTab = getByText(/sign/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(signatureTab);

  expect(fire).toBeInTheDocument();
});

test('should render a record requiring signature - trainee signed', async () => {
  const memberTrackingItems_traineeSigned: MemberTrackingItemWithAll[] = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: testUser.id,
      trackingItem: fireSafetyItem,
      user: testUser as User,
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
          trainee: null,
          authority: null,
        },
      ],
    },
  ];

  server.use(
    memberTrackingItemsGet(testUser, memberTrackingItems_traineeSigned),
    memberTrackingItemGet(memberTrackingItems_traineeSigned[0]),
    memberTrackingRecordGet(memberTrackingItems_traineeSigned[0].memberTrackingRecords[0])
  );

  const { getByText } = render(<MemberRecordTracker userId={testUser.id} />);

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  const fire = await waitFor(() => getByText(/fire/i));
  const signatureTab = getByText(/sign/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(signatureTab);
  expect(fire).toBeInTheDocument();
});

test('should render a record that is done', async () => {
  const memberTrackingItems_done: MemberTrackingItemWithAll[] = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: testUser.id,
      trackingItem: fireSafetyItem,
      user: testUser as User,
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
          trainee: null,
          authority: null,
        },
      ],
    },
  ];

  server.use(
    memberTrackingItemsGet(testUser, memberTrackingItems_done),
    memberTrackingItemGet(memberTrackingItems_done[0]),
    memberTrackingRecordGet(memberTrackingItems_done[0].memberTrackingRecords[0])
  );

  const { getByText } = render(<MemberRecordTracker userId={testUser.id} />);

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
  const memberTrackingItems_upcoming: MemberTrackingItemWithAll[] = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: testUser.id,
      trackingItem: fireSafetyItem,
      user: testUser as User,
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
          trainee: null,
          authority: null,
        },
      ],
    },
  ];

  server.use(
    memberTrackingItemsGet(testUser, memberTrackingItems_upcoming),
    memberTrackingItemGet(memberTrackingItems_upcoming[0]),
    memberTrackingRecordGet(memberTrackingItems_upcoming[0].memberTrackingRecords[0])
  );

  const { getByText } = render(<MemberRecordTracker userId={testUser.id} />);

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
  const memberTrackingItems_upcoming: MemberTrackingItemWithAll[] = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: testUser.id,
      trackingItem: fireSafetyItem,
      user: testUser as User,
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
          trainee: null,
          authority: null,
        },
      ],
    },
  ];

  server.use(
    memberTrackingItemsGet(testUser, memberTrackingItems_upcoming),
    memberTrackingItemGet(memberTrackingItems_upcoming[0]),
    memberTrackingRecordGet(memberTrackingItems_upcoming[0].memberTrackingRecords[0])
  );

  const { getByText } = render(<MemberRecordTracker userId={testUser.id} />);

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
  const memberTrackingItems_upcoming: MemberTrackingItemWithAll[] = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: testUser.id,
      trackingItem: fireSafetyItem,
      user: testUser as User,
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
          trainee: null,
          authority: null,
        },
      ],
    },
  ];

  const memberTrackingItems_Done: MemberTrackingItemWithAll[] = [
    {
      ...memberTrackingItems_upcoming[0],
      memberTrackingRecords: [
        { ...memberTrackingItems_upcoming[0].memberTrackingRecords[0], traineeSignedDate: dayjs().toDate() },
      ],
    },
  ];

  server.use(
    memberTrackingItemsGet(testUser, memberTrackingItems_upcoming),
    memberTrackingItemGet(memberTrackingItems_upcoming[0]),
    memberTrackingRecordGet(memberTrackingItems_upcoming[0].memberTrackingRecords[0])
  );

  const { getByText, getByRole, queryByText } = render(<MemberRecordTracker userId={testUser.id} />);

  await waitFor(() => getByText(/fire/i));
  await waitFor(() => getByText(/completed/i));
  const signatureButton = getByRole('button', { name: 'signature-button' });

  server.use(
    memberTrackingItemsGet(testUser, memberTrackingItems_Done),
    memberTrackingItemGet(memberTrackingItems_Done[0]),
    memberTrackingRecordGet(memberTrackingItems_Done[0].memberTrackingRecords[0]),
    rest.post('/api/membertrackingrecords/*', (req, res, ctx) => {
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
        })
      );
    })
  );

  fireEvent.click(signatureButton);
  await waitForElementToBeRemoved(() => getByRole('button', { name: 'signature-button' }));

  const loadingSpinner = getByRole('progressbar');
  expect(loadingSpinner).toBeInTheDocument();
  await waitForElementToBeRemoved(() => getByRole('progressbar'));
  await waitForElementToBeRemoved(() => getByRole('button', { name: 'signature-button' }));

  const doneTab = getByText(/done/i);

  fireEvent.click(doneTab);
  const fire = queryByText(/fire/i);

  expect(fire).toBeInTheDocument();
});
