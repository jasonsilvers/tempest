import {
  fireEvent,
  render,
  waitFor,
  waitForElementToBeRemoved,
  rtlRender,
  createWrapper,
  createTestQueryClient,
} from '../../utils/TempestTestUtils';
import React from 'react';
import MemberRecordTracker from '../../../src/components/Records/MemberRecordTracker';
import { MemberTrackingItemWithMemberTrackingRecord } from '../../../src/repositories/memberTrackingRepo';
import { server } from '../../utils/mocks/msw';
import { rest } from 'msw';
import dayjs from 'dayjs';
import 'whatwg-fetch';
import { ERole } from '../../../src/types/global';

const user = {
  id: '123',
  firstName: 'bob',
  lastName: 'jones',
  role: ERole.MEMBER,
  memberTrackingItems: [],
};

test('should render a record requiring signature - authority signed', async () => {
  const memberTrackingItems: MemberTrackingItemWithMemberTrackingRecord[] = [
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
          traineeSignedDate: null,
        },
      ],
    },
  ];

  server.use(
    rest.get('/api/user/*', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...user, memberTrackingItems }));
    })
  );

  const { getByText } = render(<MemberRecordTracker userId={user.id} />);

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  await waitFor(() => expect(getByText(/bob/i)).toBeInTheDocument());

  const fire = getByText(/fire/i);
  const signatureTab = getByText(/sign/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(signatureTab);
  expect(fire).toBeInTheDocument();
});

test('should render a record requiring signature - trainee signed', async () => {
  const memberTrackingItems: MemberTrackingItemWithMemberTrackingRecord[] = [
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
          completedDate: dayjs().toDate(),
          traineeSignedDate: dayjs().toDate(),
        },
      ],
    },
  ];

  server.use(
    rest.get('/api/user/*', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...user, memberTrackingItems }));
    })
  );

  const { getByText } = render(<MemberRecordTracker userId={user.id} />);

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  await waitFor(() => expect(getByText(/bob/i)).toBeInTheDocument());

  const fire = getByText(/fire/i);
  const signatureTab = getByText(/sign/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(signatureTab);
  expect(fire).toBeInTheDocument();
});

test('should render a record that is done', async () => {
  const memberTrackingItems: MemberTrackingItemWithMemberTrackingRecord[] = [
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

  server.use(
    rest.get('/api/user/*', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...user, memberTrackingItems }));
    })
  );

  const { getByText } = render(<MemberRecordTracker userId={user.id} />);

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  await waitFor(() => expect(getByText(/bob/i)).toBeInTheDocument());

  const fire = getByText(/fire/i);
  const doneTab = getByText(/done/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(doneTab);
  expect(fire).toBeInTheDocument();
});

test('should render a record that is in draft', async () => {
  const memberTrackingItems: MemberTrackingItemWithMemberTrackingRecord[] = [
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
          authoritySignedDate: null,
          completedDate: null,
          traineeSignedDate: null,
        },
      ],
    },
  ];

  server.use(
    rest.get('/api/user/*', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...user, memberTrackingItems }));
    })
  );

  const { getByText } = render(<MemberRecordTracker userId={user.id} />);

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  await waitFor(() => expect(getByText(/bob/i)).toBeInTheDocument());

  const fire = getByText(/fire/i);
  const draftTab = getByText(/drafts/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(draftTab);
  expect(fire).toBeInTheDocument();
});

test('should render a record that is coming due', async () => {
  const memberTrackingItems: MemberTrackingItemWithMemberTrackingRecord[] = [
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

  server.use(
    rest.get('/api/user/*', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...user, memberTrackingItems }));
    })
  );

  const { getByText } = render(<MemberRecordTracker userId={user.id} />);

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  await waitFor(() => expect(getByText(/bob/i)).toBeInTheDocument());

  const fire = getByText(/fire/i);
  const comingTab = getByText(/coming/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(comingTab);
  expect(fire).toBeInTheDocument();
});

test('should render a record that is overdue', async () => {
  const memberTrackingItems: MemberTrackingItemWithMemberTrackingRecord[] = [
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

  server.use(
    rest.get('/api/user/*', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...user, memberTrackingItems }));
    })
  );

  const { getByText } = render(<MemberRecordTracker userId={user.id} />);

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  await waitFor(() => expect(getByText(/bob/i)).toBeInTheDocument());

  const fire = getByText(/fire/i);
  const overdueTab = getByText(/overdue/i);

  expect(fire).toBeInTheDocument();
  fireEvent.click(overdueTab);
  expect(fire).toBeInTheDocument();
});

test('should render a record that is overdue', async () => {
  const memberTrackingItems: MemberTrackingItemWithMemberTrackingRecord[] = [
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

  server.use(
    rest.get('/api/user/*', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...user, memberTrackingItems }));
    })
  );

  const { queryByText } = render(<MemberRecordTracker userId={user.id} />);

  await waitFor(() => expect(queryByText(/all/i)).toBeInTheDocument());
  await waitFor(() => expect(queryByText(/bob/i)).toBeInTheDocument());

  const fire = queryByText(/fire/i);

  expect(fire).not.toBeInTheDocument();
});

test('should render old and new record if not signed by both yet', async () => {
  const memberTrackingItems: MemberTrackingItemWithMemberTrackingRecord[] = [
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

  server.use(
    rest.get('/api/user/*', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...user, memberTrackingItems }));
    })
  );

  const { getAllByText, getByText } = render(
    <MemberRecordTracker userId={user.id} />
  );

  await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
  await waitFor(() => expect(getByText(/bob/i)).toBeInTheDocument());

  const fire = getAllByText(/fire/i);
  expect(fire.length).toBe(2);
});

test('should sign record as trainee and mark as done', async () => {
  const userToBeReturnedFirstTime = {
    id: '123',
    firstName: 'bob',
    lastName: 'jones',
    role: ERole.MEMBER,
    memberTrackingItems: [
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
            authoritySignedDate: dayjs('2021-04-14').toDate(),
            completedDate: dayjs().toDate(),
            traineeSignedDate: null,
          },
        ],
      },
    ],
  };

  const userToBeReturnedTheSecondTime = {
    id: '123',
    firstName: 'bob',
    lastName: 'jones',
    role: ERole.MEMBER,
    memberTrackingItems: [
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
            authoritySignedDate: dayjs('2021-04-14').toDate(),
            completedDate: dayjs().toDate(),
            traineeSignedDate: dayjs().toDate(),
          },
        ],
      },
    ],
  };

  server.use(
    rest.post('/api/membertrackingrecord/*', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: 1,
          order: 0,
          trackingItemId: 1,
          traineeId: '123',
          authorityId: '321',
          authoritySignedDate: dayjs().toDate(),
          completedDate: dayjs().toDate(),
          traineeSignedDate: dayjs().toDate(),
        })
      );
    }),

    rest.get('/api/user/*', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(userToBeReturnedFirstTime));
    })
  );

  const queryClient = createTestQueryClient();
  queryClient.setQueryData(['profile', '123'], userToBeReturnedFirstTime);

  const { getByText, getByRole, queryByText } = rtlRender(
    <MemberRecordTracker userId={user.id} />,
    {
      wrapper: createWrapper(queryClient),
    }
  );

  await waitForElementToBeRemoved(() => getByText(/Fetching Data.../i));

  server.use(
    rest.get('/api/user/*', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(userToBeReturnedTheSecondTime));
    })
  );

  const signatureButton = getByRole('button', { name: 'signature-button' });
  fireEvent.click(signatureButton);
  await waitForElementToBeRemoved(() =>
    getByRole('button', { name: 'signature-button' })
  );

  const loadingSpinner = getByRole('progressbar');
  expect(loadingSpinner).toBeInTheDocument();
  await waitForElementToBeRemoved(() => getByRole('progressbar'));

  expect(loadingSpinner).not.toBeInTheDocument();

  //Have to await the invalidation of profile from signing
  await waitForElementToBeRemoved(() =>
    getByRole('button', { name: 'signature-button' })
  );

  const fire = queryByText(/fire/i);
  const doneTab = getByText(/done/i);

  fireEvent.click(doneTab);

  expect(fire).toBeInTheDocument();
});
