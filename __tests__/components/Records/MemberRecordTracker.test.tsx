import { fireEvent, render, waitFor } from '../../utils/TempestTestUtils';
import React from 'react';
import MemberRecordTracker from '../../../src/components/Records/MemberRecordTracker';
import { MemberTrackingItemWithMemberTrackingRecord } from '../../../src/repositories/memberTrackingRepo';
import { server } from '../../utils/mocks/msw';
import { rest } from 'msw';
import dayjs from 'dayjs';
import 'whatwg-fetch';

// rest.get('/api/login', (req, res, ctx) => {
//     console.log('get login');

//     return res(ctx.status(200), ctx.json({ firstName: 'bob' }));
//   }),
//   rest.get('*/grants', (req, res, ctx) => {
//     console.log('get grants');

//     return res(ctx.status(200), ctx.json(grants));
//   }),

test('should render a record requiring signature', async () => {
  const trackingItem: MemberTrackingItemWithMemberTrackingRecord[] = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: '123',
      memberTrackingRecords: [
        {
          id: 1,
          order: 0,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Safety',
            interval: 365,
            description: 'how to be safe with fire',
          },
          traineeId: '123',
          authorityId: null,
          authoritySignedDate: null,
          completedDate: null,
          traineeSignedDate: null,
        },
      ],
    },
  ];

  const { getByText } = render(
    <MemberRecordTracker trackingItems={trackingItem} />
  );

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  await waitFor(() => expect(getByText(/bob/i)).toBeInTheDocument());

  const fire = getByText(/fire/i);
  const signatureTab = getByText(/sign/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(signatureTab);
  expect(fire).toBeInTheDocument();
});

test('should render a record that is done', async () => {
  server.use(
    rest.get('/api/login', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ firstName: 'bob' }));
    })
  );
  const trackingItem: MemberTrackingItemWithMemberTrackingRecord[] = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: '123',
      memberTrackingRecords: [
        {
          id: 1,
          order: 0,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Safety',
            interval: 365,
            description: 'how to be safe with fire',
          },
          traineeId: '123',
          authorityId: '321',
          authoritySignedDate: dayjs().toDate(),
          completedDate: dayjs().toDate(),
          traineeSignedDate: dayjs().toDate(),
        },
      ],
    },
  ];

  const { getByText } = render(
    <MemberRecordTracker trackingItems={trackingItem} />
  );

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  await waitFor(() => expect(getByText(/bob/i)).toBeInTheDocument());

  const fire = getByText(/fire/i);
  const doneTab = getByText(/done/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(doneTab);
  expect(fire).toBeInTheDocument();
});

test('should render a record that is coming due', async () => {
  const trackingItem: MemberTrackingItemWithMemberTrackingRecord[] = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: '123',
      memberTrackingRecords: [
        {
          id: 1,
          order: 0,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Safety',
            interval: 365,
            description: 'how to be safe with fire',
          },
          traineeId: '123',
          authorityId: '321',
          authoritySignedDate: dayjs().toDate(),
          completedDate: dayjs()
            .subtract(365 - 30, 'days')
            .toDate(),
          traineeSignedDate: dayjs().toDate(),
        },
      ],
    },
  ];

  const { getByText } = render(
    <MemberRecordTracker trackingItems={trackingItem} />
  );

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  await waitFor(() => expect(getByText(/bob/i)).toBeInTheDocument());

  const fire = getByText(/fire/i);
  const comingTab = getByText(/coming/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(comingTab);
  expect(fire).toBeInTheDocument();
});

test('should render a record that is overdue', async () => {
  const trackingItem: MemberTrackingItemWithMemberTrackingRecord[] = [
    {
      isActive: true,
      trackingItemId: 1,
      userId: '123',
      memberTrackingRecords: [
        {
          id: 1,
          order: 0,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Safety',
            interval: 365,
            description: 'how to be safe with fire',
          },
          traineeId: '123',
          authorityId: '321',
          authoritySignedDate: dayjs().toDate(),
          completedDate: dayjs().subtract(370, 'days').toDate(),
          traineeSignedDate: dayjs().toDate(),
        },
      ],
    },
  ];

  const { getByText } = render(
    <MemberRecordTracker trackingItems={trackingItem} />
  );

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  await waitFor(() => expect(getByText(/bob/i)).toBeInTheDocument());

  const fire = getByText(/fire/i);
  const overdueTab = getByText(/overdue/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(overdueTab);
  expect(fire).toBeInTheDocument();
});

test('should render a record that is overdue', async () => {
  const trackingItem: MemberTrackingItemWithMemberTrackingRecord[] = [
    {
      isActive: false,
      trackingItemId: 1,
      userId: '123',
      memberTrackingRecords: [
        {
          id: 1,
          order: 0,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Safety',
            interval: 365,
            description: 'how to be safe with fire',
          },
          traineeId: '123',
          authorityId: '321',
          authoritySignedDate: dayjs().toDate(),
          completedDate: dayjs().subtract(370, 'days').toDate(),
          traineeSignedDate: dayjs().toDate(),
        },
      ],
    },
  ];

  const { queryByText } = render(
    <MemberRecordTracker trackingItems={trackingItem} />
  );

  await waitFor(() => expect(queryByText(/all/i)).toBeInTheDocument());
  await waitFor(() => expect(queryByText(/bob/i)).toBeInTheDocument());

  const fire = queryByText(/fire/i);

  expect(fire).not.toBeInTheDocument();
});

test('should render old and new record if not signed by both yet', async () => {
  const trackingItem: MemberTrackingItemWithMemberTrackingRecord[] = [
    {
      // false here
      isActive: true,
      trackingItemId: 1,
      userId: '123',
      memberTrackingRecords: [
        {
          id: 2,
          order: 1,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Safety',
            interval: 365,
            description: 'how to be safe with fire',
          },
          traineeId: '123',
          authorityId: '321',
          authoritySignedDate: null,
          completedDate: dayjs().subtract(10, 'days').toDate(),
          traineeSignedDate: dayjs().toDate(),
        },
        {
          id: 1,
          order: 0,
          trackingItemId: 1,
          trackingItem: {
            id: 1,
            title: 'Fire Safety',
            interval: 365,
            description: 'how to be safe with fire',
          },
          traineeId: '123',
          authorityId: '321',
          authoritySignedDate: dayjs().toDate(),
          completedDate: dayjs().subtract(370, 'days').toDate(),
          traineeSignedDate: dayjs().toDate(),
        },
      ],
    },
  ];

  const { getAllByText, getByText } = render(
    <MemberRecordTracker trackingItems={trackingItem} />
  );

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  await waitFor(() => expect(getByText(/bob/i)).toBeInTheDocument());

  const fire = getAllByText(/fire/i);
  expect(fire.length).toBe(2);
});
