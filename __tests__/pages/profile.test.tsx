import {
  waitFor,
  fireEvent,
  rtlRender,
  Wrapper,
  within,
  render,
  waitForLoadingToFinish,
} from '../testutils/TempestTestUtils';
import Profile, { getServerSideProps } from '../../src/pages/Profile/[id]';
import 'whatwg-fetch';
import { server, rest } from '../testutils/mocks/msw';
import singletonRouter from 'next/router';
import mockRouter from 'next-router-mock';
import { andrewMonitor, bobJones } from '../testutils/mocks/fixtures';
import { EUri } from '../../src/const/enums';
import { findUserByIdReturnAllIncludes } from '../../src/repositories/userRepo';
import { useMemberTrackingItemsForUser } from '../../src/hooks/api/users';
import { mockMethodAndReturn } from '../testutils/mocks/repository';
import { GetServerSidePropsContext } from 'next/types';
import React from 'react';
import { MemberReport } from '../../src/components/Records/MemberRecordTracker/MemberReport';
import dayjs from 'dayjs';

jest.mock('../../src/repositories/userRepo');
jest.mock('../../src/repositories/memberTrackingRepo');
jest.mock('next/router', () => require('next-router-mock'));
jest.mock('next/dist/client/router', () => require('next-router-mock'));

const userWithTrackingItems = {
  ...bobJones,
  memberTrackingItems: [
    {
      status: 'ACTIVE',
      userId: 1,
      createdAt: '2021-08-27T19:28:10.525Z',
      trackingItemId: 3,
      trackingItem: {
        id: 3,
        title: 'Fire Safety',
        description: 'How to be SAFE when using Fire',
        interval: 365,
        status: 'ACTIVE',
      },
      memberTrackingRecords: [
        {
          id: 5,
          traineeSignedDate: dayjs().toDate(),
          authoritySignedDate: dayjs().toDate(),
          authorityId: 4,
          createdAt: dayjs().toDate(),
          completedDate: dayjs().toDate(),
          order: 3,
          traineeId: 1,
          trackingItemId: 3,
        },
      ],
    },
    {
      status: 'ACTIVE',
      userId: 1,
      createdAt: '2021-08-27T19:28:10.525Z',
      trackingItemId: 4,
      trackingItem: {
        id: 4,
        title: 'Fire Ext',
        description: 'How to be SAFE when using Fire',
        interval: 365,
        status: 'ACTIVE',
      },
      memberTrackingRecords: [
        {
          id: 5,
          traineeSignedDate: dayjs().toDate(),
          authoritySignedDate: dayjs().toDate(),
          authorityId: 4,
          createdAt: dayjs().toDate(),
          completedDate: dayjs()
            .subtract(365 - 1, 'days')
            .toDate(),
          order: 3,
          traineeId: 3,
          trackingItemId: 3,
        },
      ],
    },
  ],
};

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
  server.use(
    rest.get('/api/users/123', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(bobJones));
    }),
    rest.get('/api/users/321', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(andrewMonitor));
    }),
    rest.get('/api/users/123/membertrackingitems/in_progress', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(andrewMonitor));
    })
  );
});
beforeEach(() => {
  mockRouter.setCurrentUrl('/initial');
  mockMethodAndReturn(useMemberTrackingItemsForUser, userWithTrackingItems);
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  jest.clearAllMocks();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

it('renders the profile page with loading profile text', async () => {
  singletonRouter.push({
    query: { id: 123 },
  });
  const { getByText } = rtlRender(<Profile initialMemberData={bobJones} />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());
});

it('renders the profile page with bad permissions', async () => {
  singletonRouter.push({
    query: { id: 321 },
  });
  const { getByText } = rtlRender(<Profile />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitFor(() => getByText(/permission to view/i));
});

// MSW broke stuff
it('renders the profile page', async () => {
  singletonRouter.push({
    query: { id: 123 },
  });
  const { getByText } = rtlRender(<Profile initialMemberData={bobJones} />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitFor(() => expect(getByText(/jones/i)).toBeInTheDocument());
});

it('should not show breadcrumbs if member', async () => {
  singletonRouter.push({
    query: { id: 123 },
  });
  const { getByText, queryByText } = rtlRender(<Profile initialMemberData={bobJones} />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitFor(() => expect(getByText(/jones/i)).toBeInTheDocument());
  expect(queryByText(/dashboard/i)).not.toBeInTheDocument();
});

it('should show breadcrumbs if monitor and not on own profile', async () => {
  server.use(
    rest.get('/api/users/123', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(bobJones));
    }),
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(andrewMonitor));
    })
  );
  singletonRouter.push({
    query: { id: 123 },
  });
  const { getByText, queryByText } = rtlRender(<Profile initialMemberData={bobJones} />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitFor(() => expect(getByText(/jones/i)).toBeInTheDocument());
  expect(queryByText(/dashboard/i)).toBeInTheDocument();
});

it('opens the add new training dialog modal', async () => {
  server.use(
    rest.get('/api/users/123', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(bobJones));
    }),

    rest.get(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([
          {
            description: 'test item',
            id: 1,
            interval: 365,
            title: 'test title',
          },
        ])
      );
    }),
    rest.get('/api/users/123/membertrackingitems/all', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json([]));
    })
  );

  singletonRouter.push({
    query: { id: 123 },
  });
  const screen = rtlRender(<Profile initialMemberData={bobJones} />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });
  expect(await screen.findByText(/jones/i)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/add/i));

  await waitFor(() => expect(screen.getByText(/add new training/i)).toBeInTheDocument());

  // handle close modal by clicking off the modal
  fireEvent.click(screen.getByRole('button', { name: /dialog-close-button/i }));
  expect(screen.queryByText(/add new training/i)).not.toBeInTheDocument();
});

test('should do serverside rending and return user', async () => {
  const user = {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  };

  mockMethodAndReturn(findUserByIdReturnAllIncludes, user);
  const value = await getServerSideProps({ context: { params: { id: 1 } } } as unknown as GetServerSidePropsContext);

  expect(value.props.initialMemberData).toStrictEqual(user);
});

test('should render report widget and show correct counts', async () => {
  server.use(
    rest.get('/api/users/123/membertrackingitems/all', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(userWithTrackingItems));
    })
  );

  const screen = render(<MemberReport memberId={bobJones.id} />);

  await waitFor(() => expect(screen.getByText(/readiness stats/i)).toBeInTheDocument());

  const doneCountDiv = screen.getByTestId('report-done');
  const doneCount = within(doneCountDiv).getByText(1);

  expect(doneCount).toBeInTheDocument();

  const upcomingCountDiv = screen.getByTestId('report-upcoming');
  const upcomingCount = within(upcomingCountDiv).getByText(1);

  expect(upcomingCount).toBeInTheDocument();

  const overDueCountDiv = screen.getByTestId('report-overdue');
  const overDueCount = within(overDueCountDiv).getByText(0);

  expect(overDueCount).toBeInTheDocument();

  expect(screen.getByText(/2 trainings/i)).toBeInTheDocument();
});

test('should render detailed report', async () => {
  server.use(
    rest.get('/api/users/123/membertrackingitems/all', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(userWithTrackingItems));
    })
  );

  const screen = render(<MemberReport memberId={bobJones.id} />);

  await waitForLoadingToFinish();

  await waitFor(() => expect(screen.getByText(/readiness stats/i)).toBeInTheDocument());

  const reportButton = screen.getByRole('button', { name: /reporting excel/i });

  fireEvent.click(reportButton);

  const banner = screen.getByRole('banner');

  within(banner).getByText(/reporting excel/i);

  const doneButton = screen.getByRole('button', {
    name: /done/i,
  });

  fireEvent.click(doneButton);
});
