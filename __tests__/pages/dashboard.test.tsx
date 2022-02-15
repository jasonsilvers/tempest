import { UserContextProvider } from '@tron/nextjs-auth-p1';
import dayjs from 'dayjs';
import { rest } from 'msw';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import 'whatwg-fetch';
import { QueryProvider } from '../../src/components/QueryProvider';
import { ERole, EUri } from '../../src/const/enums';
import { Button } from '../../src/lib/ui';
import Dashboard, { getStaticProps } from '../../src/pages/Dashboard';
import { getUsersWithMemberTrackingRecords, LoggedInUser } from '../../src/repositories/userRepo';
import { bobJones } from '../testutils/mocks/fixtures';
import { server } from '../testutils/mocks/msw';
import { mockMethodAndReturn } from '../testutils/mocks/repository';
import {
  render,
  rtlRender,
  waitFor,
  waitForElementToBeRemoved,
  waitForLoadingToFinish,
  within,
  userEvent,
  fireEvent,
} from '../testutils/TempestTestUtils';

jest.mock('../../src/repositories/userRepo');

const users = {
  users: [
    {
      id: 'daf12fc8-65a2-416a-bbf1-662b3e52be85',
      dodId: '1143209890',
      firstName: 'Sandra',
      lastName: 'Clark',
      middleName: null,
      email: 'Alysa_Erdman@hotmail.com',
      createdAt: '2021-08-27T19:28:10.509Z',
      updatedAt: '2021-08-28T00:42:55.528Z',
      lastLogin: '2021-08-27T19:58:29.894Z',
      roleId: 3,
      organizationId: 'f50d7142-9150-4b6a-b87f-54e30be46972',
      rank: 'SSgt/E5',
      afsc: '1A1X4',
      dutyTitle: '24/7 solutions maximize',
      address: '15 WG/WSA Tron, Bldg 1102',
      role: { id: 3, name: 'monitor' },
      memberTrackingItems: [],
    },
    {
      id: '4e3de847-e79a-465d-af8f-81cf5b900c38',
      dodId: '123',
      firstName: 'Joe',
      lastName: 'Smith',
      middleName: null,
      email: 'Rylee_Glover@hotmail.com',
      createdAt: '2021-08-27T19:28:10.479Z',
      updatedAt: '2021-08-30T18:00:03.660Z',
      lastLogin: '2021-08-28T00:43:56.579Z',
      roleId: 1,
      organizationId: 'd3f67c13-e88a-434a-8d20-a4973f681ccc',
      rank: 'SSgt/E5',
      afsc: '3P3X3',
      dutyTitle: 'strategic networks benchmark',
      address: '15 WG/WSA Tron, Bldg 1102',
      role: { id: 1, name: 'admin' },
      memberTrackingItems: [
        {
          isActive: true,
          userId: '4e3de847-e79a-465d-af8f-81cf5b900c38',
          createdAt: '2021-08-27T19:28:10.525Z',
          trackingItemId: 3,
          trackingItem: { id: 3, title: 'Fire Safety', description: 'How to be SAFE when using Fire', interval: 365 },
          memberTrackingRecords: [
            {
              id: 5,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: dayjs().toDate(),
              completedDate: null,
              order: 3,
              traineeId: '4e3de847-e79a-465d-af8f-81cf5b900c38',
              trackingItemId: 3,
            },
            {
              id: 1,
              traineeSignedDate: '2021-08-18T09:38:12.976Z',
              authoritySignedDate: '2021-08-12T23:09:38.453Z',
              authorityId: 'daf12fc8-65a2-416a-bbf1-662b3e52be85',
              createdAt: '2021-08-27T19:28:10.568Z',
              completedDate: '2021-08-10T13:37:20.770Z',
              order: 2,
              traineeId: '4e3de847-e79a-465d-af8f-81cf5b900c38',
              trackingItemId: 3,
            },
          ],
        },
        {
          isActive: true,
          userId: '4e3de847-e79a-465d-af8f-81cf5b900c38',
          createdAt: '2021-08-27T19:28:10.548Z',
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
              createdAt: '2021-08-27T19:28:10.618Z',
              completedDate: null,
              order: 1,
              traineeId: '4e3de847-e79a-465d-af8f-81cf5b900c38',
              trackingItemId: 4,
            },
          ],
        },
        {
          isActive: true,
          userId: '4e3de847-e79a-465d-af8f-81cf5b900c38',
          createdAt: '2021-08-27T19:28:10.558Z',
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 365,
          },
          memberTrackingRecords: [
            {
              id: 4,
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2021-08-27T19:28:10.630Z',
              completedDate: null,
              order: 1,
              traineeId: '4e3de847-e79a-465d-af8f-81cf5b900c38',
              trackingItemId: 5,
            },
          ],
        },
      ],
    },
  ],
};

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});

beforeEach(() => {
  server.use(
    // return a user with the right permissions
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...bobJones, role: { id: 0, name: ERole.MONITOR } } as LoggedInUser));
    }),

    // set up tracking items to be returned
    rest.get(EUri.USERS, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(users));
    }),
    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          organizations: [
            { id: 'f50d7142-9150-4b6a-b87f-54e30be46972', name: '15th MDG', parentId: null },
            { id: '2', name: 'org2', parentId: null },
          ],
        })
      );
    })
  );
});

afterAll(() => {
  server.close();
  jest.clearAllMocks();
});

afterEach(() => {
  server.resetHandlers();
});

// it('renders the Dashboard page', async () => {
//   const { getByText } = render(<Dashboard />);

//   await waitFor(() => expect(getByText(/loading/i)).toBeInTheDocument());

//   await waitForElementToBeRemoved(() => getByText(/loading/i));
//   await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());
// });

// it('should show loading spinner for status counts', async () => {
//   server.use(
//     rest.get(EUri.USERS, (req, res, ctx) => {
//       return res(ctx.delay(2000), ctx.status(200), ctx.json(users));
//     })
//   );

//   const { getAllByRole, getByText } = render(<Dashboard />);
//   await waitForElementToBeRemoved(() => getByText(/loading/i));

//   expect(getAllByRole('progressbar').length).toBe(4);

//   const allContainer = getByText(/all/i);

//   await waitForElementToBeRemoved(() => within(allContainer.parentElement).getByRole('progressbar'), { timeout: 3000 });
// });

// it('should show correct counts', async () => {
//   const { getByText } = render(<Dashboard />);

//   await waitFor(() => expect(getByText(/loading/i)).toBeInTheDocument());

//   await waitForElementToBeRemoved(() => getByText(/loading/i));
//   await waitFor(() => expect(getByText(/all/i)).toBeInTheDocument());

//   const allContainer = getByText(/all/i);
//   const upcomingContainer = getByText(/upcoming/i);
//   const overdueContainer = getByText(/overdue/i);
//   expect(within(allContainer.parentElement).getByText('2')).toBeInTheDocument();
//   expect(within(upcomingContainer.parentElement).getByText('0')).toBeInTheDocument();
//   expect(within(overdueContainer.parentElement).getByText('1')).toBeInTheDocument();
// });

it('should filter by name', async () => {
  const { getByText, queryByText, getByLabelText } = render(<Dashboard />);

  await waitFor(() => expect(getByText(/loading/i)).toBeInTheDocument());

  await waitForElementToBeRemoved(() => getByText(/loading/i));

  expect(getByText(/clark, sandra/i)).toBeInTheDocument();
  expect(getByText(/smith, joe/i)).toBeInTheDocument();

  const searchInput = getByLabelText(/search/i);

  userEvent.type(searchInput, 'smith');
  expect(queryByText(/clark, sandra/i)).not.toBeInTheDocument();
  expect(getByText(/smith, joe/i)).toBeInTheDocument();
});

it('should filter by organization', async () => {
  const { getByText, queryByText, getByLabelText } = render(<Dashboard />);

  await waitFor(() => expect(getByText(/loading/i)).toBeInTheDocument());

  await waitForElementToBeRemoved(() => getByText(/loading/i));

  expect(getByText(/clark, sandra/i)).toBeInTheDocument();
  expect(getByText(/smith, joe/i)).toBeInTheDocument();

  const searchInput = getByLabelText(/organizations/i);

  userEvent.type(searchInput, '15');
  fireEvent.click(getByText(/15th mdg/i));
  expect(getByText(/clark, sandra/i)).toBeInTheDocument();
  expect(queryByText(/smith, joe/i)).not.toBeInTheDocument();
});

// it('should filter by Status', async () => {
//   const { getByText, queryByText } = render(<Dashboard />);

//   await waitFor(() => expect(getByText(/loading/i)).toBeInTheDocument());

//   await waitForElementToBeRemoved(() => getByText(/loading/i));

//   expect(getByText(/clark, sandra/i)).toBeInTheDocument();
//   expect(getByText(/smith, joe/i)).toBeInTheDocument();

//   fireEvent.click(getByText(/overdue/i));
//   expect(queryByText(/clark, sandra/i)).not.toBeInTheDocument();
//   expect(getByText(/smith, joe/i)).toBeInTheDocument();

//   fireEvent.click(getByText(/upcoming/i));
//   expect(queryByText(/clark, sandra/i)).not.toBeInTheDocument();
//   expect(queryByText(/smith, joe/i)).toBeInTheDocument();

//   fireEvent.click(getByText(/done/i));
//   expect(queryByText(/clark, sandra/i)).not.toBeInTheDocument();
//   expect(queryByText(/smith, joe/i)).not.toBeInTheDocument();

//   fireEvent.click(getByText(/all/i));
//   expect(queryByText(/clark, sandra/i)).toBeInTheDocument();
//   expect(queryByText(/smith, joe/i)).toBeInTheDocument();
// });

it('should show error on query failure', async () => {
  server.use(
    rest.get(EUri.USERS, (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'There was an error' }));
    })
  );

  const notistackRef = React.createRef<SnackbarProvider>();
  const onClickDismiss = (key: string) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  const { findByText } = rtlRender(
    <SnackbarProvider
      maxSnack={3}
      ref={notistackRef}
      action={(key: string) => <Button onClick={onClickDismiss(key)}>Dismiss</Button>}
    >
      <QueryProvider
        queryClientOptions={{
          defaultOptions: {
            queries: {
              retry: false,
            },
          },
        }}
      >
        <UserContextProvider loginUrl={EUri.LOGIN}>
          <Dashboard />
        </UserContextProvider>
      </QueryProvider>
    </SnackbarProvider>
  );
  await waitForLoadingToFinish();

  await findByText(/error retrieving/i);
});

it('should not allow access with incorrect permissions', async () => {
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...bobJones, role: { id: 0, name: ERole.MEMBER } } as LoggedInUser));
    })
  );

  const { getByText } = render(<Dashboard />);

  await waitFor(() => expect(getByText(/loading/i)).toBeInTheDocument());

  await waitForElementToBeRemoved(() => getByText(/loading/i));

  expect(getByText(/you are not allowed to view this page/i)).toBeInTheDocument();
});

test('should return props for static props with no prisma', async () => {
  mockMethodAndReturn(getUsersWithMemberTrackingRecords, []);

  const { props } = await getStaticProps();

  expect(props.dehydratedState.queries[0].state.data).toEqual([]);
  expect(props.dehydratedState.queries[0].queryKey).toEqual(['users']);
});
