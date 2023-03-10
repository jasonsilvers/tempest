import dayjs from 'dayjs';
import mockRouter from 'next-router-mock';
import singletonRouter from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import React from 'react';
import 'whatwg-fetch';
import { EUri } from '../../src/const/enums';
import { useMemberTrackingItemsForUser } from '../../src/hooks/api/users';
import Profile, { getServerSideProps } from '../../src/pages/Tempest/Profile/[id]';
import { findUserByIdReturnAllIncludes } from '../../src/repositories/userRepo';
import { andrewMonitor, bobJones } from '../testutils/mocks/fixtures';
import { rest, server } from '../testutils/mocks/msw';
import { mockMethodAndReturn } from '../testutils/mocks/repository';
import { fireEvent, rtlRender, waitFor, waitForLoadingToFinish, within, Wrapper } from '../testutils/TempestTestUtils';

jest.mock('../../src/repositories/userRepo');
jest.mock('../../src/repositories/memberTrackingRepo');
jest.mock('next/router', () => require('next-router-mock'));
jest.mock('next/dist/client/router', () => require('next-router-mock'));

const testPPEItem = {
  id: 1,
  name: 'Steel Toe',
  provided: true,
  inUse: false,
  userId: 5,
};

const testPPEItem2 = {
  id: 1,
  name: 'gas mask',
  provided: true,
  inUse: false,
  userId: 5,
};

const userWithUpcomingAndInProgressTraining = {
  ...bobJones,
  memberTrackingItems: [
    {
      status: 'ACTIVE',
      userId: bobJones.id,
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
          order: 1,
          traineeId: bobJones.id,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 365,
            status: 'ACTIVE',
          },
        },
      ],
    },
    {
      status: 'ACTIVE',
      userId: bobJones.id,
      createdAt: '2021-08-27T19:28:10.525Z',
      trackingItemId: 7,
      trackingItem: {
        id: 7,
        title: 'MDG Training',
        description: 'Random Training',
        interval: 365,
        status: 'ACTIVE',
      },
      memberTrackingRecords: [
        {
          id: 2,
          traineeSignedDate: dayjs().toDate(),
          authoritySignedDate: dayjs().toDate(),
          authorityId: 4,
          createdAt: dayjs().toDate(),
          completedDate: dayjs()
            .subtract(365 - 1, 'days')
            .toDate(),
          order: 2,
          traineeId: bobJones.id,
          trackingItemId: 7,
          trackingItem: {
            id: 7,
            title: 'MDG Training',
            description: 'Random Training',
            interval: 365,
            status: 'ACTIVE',
          },
        },
      ],
    },
    {
      status: 'ACTIVE',
      userId: bobJones.id,
      createdAt: '2021-08-27T19:28:10.548Z',
      trackingItemId: 4,
      trackingItem: {
        id: 4,
        title: 'Big Bug Safety',
        description: 'There are big bugs in Hawaii!  Be careful!',
        interval: 365,
        status: 'ACTIVE',
      },
      memberTrackingRecords: [
        {
          id: 3,
          traineeSignedDate: '2021-08-18T09:38:12.976Z',
          authoritySignedDate: '2021-08-12T23:09:38.453Z',
          authorityId: 'daf12fc8-65a2-416a-bbf1-662b3e52be85',
          createdAt: '2021-08-27T19:28:10.568Z',
          completedDate: '2021-08-10T13:37:20.770Z',
          order: 2,
          traineeId: bobJones.id,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
            status: 'ACTIVE',
          },
        },
      ],
    },
  ],
};

const userWithCompletedTrainings = {
  ...bobJones,
  memberTrackingItems: [
    {
      status: 'ACTIVE',
      userId: bobJones.id,
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
          order: 1,
          traineeId: bobJones.id,
          trackingItemId: 3,
          trackingItem: {
            id: 3,
            title: 'Fire Safety',
            description: 'How to be SAFE when using Fire',
            interval: 365,
            status: 'ACTIVE',
          },
        },
      ],
    },
    {
      status: 'ACTIVE',
      userId: bobJones.id,
      createdAt: '2021-08-27T19:28:10.525Z',
      trackingItemId: 7,
      trackingItem: {
        id: 7,
        title: 'MDG Training',
        description: 'Random Training',
        interval: 365,
        status: 'ACTIVE',
      },
      memberTrackingRecords: [
        {
          id: 2,
          traineeSignedDate: null,
          authoritySignedDate: null,
          authorityId: 4,
          createdAt: dayjs().toDate(),
          completedDate: null,
          order: 2,
          traineeId: bobJones.id,
          trackingItemId: 7,
          trackingItem: {
            id: 7,
            title: 'MDG Training',
            description: 'Random Training',
            interval: 365,
            status: 'ACTIVE',
          },
        },
        {
          id: 2,
          traineeSignedDate: dayjs().toDate(),
          authoritySignedDate: dayjs().toDate(),
          authorityId: 4,
          createdAt: dayjs().toDate(),
          completedDate: dayjs()
            .subtract(365 - 1, 'days')
            .toDate(),
          order: 2,
          traineeId: bobJones.id,
          trackingItemId: 7,
          trackingItem: {
            id: 7,
            title: 'MDG Training',
            description: 'Random Training',
            interval: 365,
            status: 'ACTIVE',
          },
        },
      ],
    },
    {
      status: 'ACTIVE',
      userId: bobJones.id,
      createdAt: '2021-08-27T19:28:10.548Z',
      trackingItemId: 4,
      trackingItem: {
        id: 4,
        title: 'Big Bug Safety',
        description: 'There are big bugs in Hawaii!  Be careful!',
        interval: 365,
        status: 'ACTIVE',
      },
      memberTrackingRecords: [
        {
          id: 3,
          traineeSignedDate: '2021-08-18T09:38:12.976Z',
          authoritySignedDate: '2021-08-12T23:09:38.453Z',
          authorityId: 'daf12fc8-65a2-416a-bbf1-662b3e52be85',
          createdAt: '2021-08-27T19:28:10.548Z',
          completedDate: '2021-08-10T13:37:20.770Z',
          order: 2,
          traineeId: bobJones.id,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
            status: 'ACTIVE',
          },
        },
        {
          id: 3,
          traineeSignedDate: null,
          authoritySignedDate: null,
          authorityId: null,
          createdAt: '2021-08-27T19:28:10.548Z',
          completedDate: null,
          order: 4,
          traineeId: bobJones.id,
          trackingItemId: 4,
          trackingItem: {
            id: 4,
            title: 'Big Bug Safety',
            description: 'There are big bugs in Hawaii!  Be careful!',
            interval: 365,
            status: 'ACTIVE',
          },
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
    rest.get('/api/tempest/users/123', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(bobJones));
    }),
    rest.get('/api/tempest/users/321', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(andrewMonitor));
    }),
    rest.get('/api/tempest/users/123/membertrackingitems/in_progress', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(userWithCompletedTrainings));
    }),
    rest.get('/api/tempest/users/123/membertrackingitems/all', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(userWithUpcomingAndInProgressTraining));
    })
  );
});

beforeEach(() => {
  mockRouter.setCurrentUrl('/initial');
  mockMethodAndReturn(useMemberTrackingItemsForUser, userWithUpcomingAndInProgressTraining);
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  jest.clearAllMocks();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

describe('Testing profile page', () => {
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
      rest.get('/api/tempest/users/123', (req, res, ctx) => {
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
});

describe('Testing Member Report Widget on profile page', () => {
  test('should render report widget and show correct counts', async () => {
    singletonRouter.push({
      query: { id: 123 },
    });
    const screen = rtlRender(<Profile initialMemberData={bobJones} />, {
      wrapper: function withWrapper(props) {
        return <Wrapper {...props} />;
      },
    });

    await waitFor(() => expect(screen.getByText(/readiness stats/i)).toBeInTheDocument());

    const doneCountDiv = screen.getByTestId('report-done');
    const doneCount = within(doneCountDiv).getByText(1);

    expect(doneCount).toBeInTheDocument();

    const upcomingCountDiv = screen.getByTestId('report-upcoming');
    const upcomingCount = within(upcomingCountDiv).getByText(1);

    expect(upcomingCount).toBeInTheDocument();

    const overDueCountDiv = screen.getByTestId('report-overdue');
    const overDueCount = within(overDueCountDiv).getByText(1);

    expect(overDueCount).toBeInTheDocument();

    expect(screen.getByText(/3 trainings/i)).toBeInTheDocument();
  });

  test('should render detailed report', async () => {
    server.use(
      rest.get('/api/tempest/ppeitems', (req, res, ctx) => {
        return res(
          ctx.json({
            ppeItems: [testPPEItem, testPPEItem2],
          })
        );
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

    await waitFor(() => expect(screen.getByText(/readiness stats/i)).toBeInTheDocument());

    const reportButton = screen.getByRole('button', { name: /export/i });

    fireEvent.click(reportButton);

    expect(await screen.findByText(/safety and health training record/i)).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getByText(/steel toe/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/gas mask/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/big bug safety/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/fire safety/i)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', {
      name: /close/i,
    });
    fireEvent.click(closeButton);
  });
});

describe('Testing the Quick Assign Wigdet on the profile page', () => {
  test('Should show upcoming and overdue trainings in quick assign widget', async () => {
    singletonRouter.push({
      query: { id: 123 },
    });
    const screen = rtlRender(<Profile initialMemberData={bobJones} />, {
      wrapper: function withWrapper(props) {
        return <Wrapper {...props} />;
      },
    });

    await waitFor(() => expect(screen.getByText(/jones/i)).toBeInTheDocument());
    await waitForLoadingToFinish();

    const quickAssignWidget = screen.getByLabelText('quick-assign-widget');
    expect(quickAssignWidget).toBeInTheDocument();

    const mdgTraining = within(quickAssignWidget).getByText('MDG Training');
    expect(mdgTraining).toBeInTheDocument();
  });

  test('should not show done training items ', async () => {
    singletonRouter.push({
      query: { id: bobJones.id },
    });
    const screen = rtlRender(<Profile initialMemberData={bobJones} />, {
      wrapper: function withWrapper(props) {
        return <Wrapper {...props} />;
      },
    });

    expect(screen.queryByText(/fire safety/i)).not.toBeInTheDocument();
  });

  test('should remove training item from quick add widget to training in progress', async () => {
    singletonRouter.push({
      query: { id: bobJones.id },
    });
    const screen = rtlRender(<Profile initialMemberData={bobJones} />, {
      wrapper: function withWrapper(props) {
        return <Wrapper {...props} />;
      },
    });
    await waitFor(() => expect(screen.getByText(/jones/i)).toBeInTheDocument());
    await waitForLoadingToFinish();

    server.use(
      rest.get('/api/tempest/users/123/membertrackingitems/in_progress', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(userWithCompletedTrainings));
      }),
      rest.post('/api/tempest/membertrackingrecords', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            completedDate: null,
            traineeId: bobJones.id,
            trackingItemId: 7,
          })
        );
      })
    );
    const addButton = screen.getAllByTestId('quickAddButton');

    fireEvent.click(addButton[0]);

    const alert = await screen.findByText(/a record was successfully added/i);
    expect(alert).toBeInTheDocument();
  });

  test('should show zero training if user has no upcoming/overdue trainings', async () => {
    server.use(
      rest.get('/api/tempest/users/123/membertrackingitems/all', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(userWithCompletedTrainings));
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
    await waitForLoadingToFinish();
    expect(screen.getByText('Upcoming Training')).toBeInTheDocument();
  });
});
