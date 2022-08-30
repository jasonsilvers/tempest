import { Button } from '@mui/material';
import { UserContextProvider } from '@tron/nextjs-auth-p1';
import dayjs from 'dayjs';
import { rest } from 'msw';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import 'whatwg-fetch';
import { QueryProvider } from '../../src/components/QueryProvider';
import { ERole, EUri } from '../../src/const/enums';
import Dashboard from '../../src/pages/Dashboard';

import { LoggedInUser } from '../../src/repositories/userRepo';
import { bobJones } from '../testutils/mocks/fixtures';
import { server } from '../testutils/mocks/msw';

import {
  render,
  rtlRender,
  waitFor,
  waitForElementToBeRemoved,
  waitForLoadingToFinish,
  userEvent,
  fireEvent,
  within,
} from '../testutils/TempestTestUtils';

jest.mock('../../src/repositories/userRepo');

const users = {
  users: [
    {
      id: 1,
      firstName: 'Sandra',
      lastName: 'Clark',
      middleName: null,
      email: 'Alysa_Erdman@hotmail.com',
      createdAt: '2021-08-27T19:28:10.509Z',
      updatedAt: '2021-08-28T00:42:55.528Z',
      lastLogin: '2021-08-27T19:58:29.894Z',
      roleId: 3,
      organizationId: 1,
      reportingOrganizationId: 1,
      rank: 'SSgt/E5',
      afsc: '1A1X4',
      dutyTitle: '24/7 solutions maximize',
      address: '15 WG/WSA Tron, Bldg 1102',
      role: { id: 3, name: 'monitor' },
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
      ],
    },
    {
      id: 2,
      firstName: 'Joe',
      lastName: 'Smith',
      middleName: null,
      email: 'Rylee_Glover@hotmail.com',
      createdAt: '2021-08-27T19:28:10.479Z',
      updatedAt: '2021-08-30T18:00:03.660Z',
      lastLogin: '2021-08-28T00:43:56.579Z',
      roleId: 1,
      organizationId: 2,
      reportingOrganizationId: 2,
      rank: 'SSgt/E5',
      afsc: '3P3X3',
      dutyTitle: 'strategic networks benchmark',
      address: '15 WG/WSA Tron, Bldg 1102',
      role: { id: 1, name: 'admin' },
      memberTrackingItems: [
        {
          status: 'ACTIVE',
          userId: 2,
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
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: dayjs().toDate(),
              completedDate: null,
              order: 3,
              traineeId: 2,
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
              traineeId: 2,
              trackingItemId: 3,
            },
          ],
        },
        {
          status: 'ACTIVE',
          userId: 2,
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
              traineeSignedDate: null,
              authoritySignedDate: null,
              authorityId: null,
              createdAt: '2021-08-27T19:28:10.618Z',
              completedDate: null,
              order: 1,
              traineeId: 2,
              trackingItemId: 4,
            },
          ],
        },
        {
          status: 'ACTIVE',
          userId: 2,
          createdAt: '2021-08-27T19:28:10.558Z',
          trackingItemId: 5,
          trackingItem: {
            id: 5,
            title: 'Keyboard Warrior Training',
            description: 'How to be a true keyboard warrior via writing code',
            interval: 365,
            status: 'ACTIVE',
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
              traineeId: 2,
              trackingItemId: 5,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      firstName: 'FirstName3',
      lastName: 'LastName3',
      middleName: null,
      email: 'first_last@hotmail.com',
      createdAt: '2021-08-27T19:28:10.509Z',
      updatedAt: '2021-08-28T00:42:55.528Z',
      lastLogin: '2021-08-27T19:58:29.894Z',
      roleId: 3,
      organizationId: 2,
      rank: 'SSgt/E5',
      afsc: '1A1X4',
      dutyTitle: '24/7 solutions maximize',
      address: '15 WG/WSA Tron, Bldg 1102',
      role: { id: 3, name: 'member' },
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
    },
    {
      id: 4,
      firstName: 'FirstName4',
      lastName: 'LastName4',
      middleName: null,
      email: 'first_last4@hotmail.com',
      createdAt: '2021-08-27T19:28:10.509Z',
      updatedAt: '2021-08-28T00:42:55.528Z',
      lastLogin: '2021-08-27T19:58:29.894Z',
      roleId: 3,
      organizationId: 2,
      rank: 'SSgt/E5',
      afsc: '1A1X4',
      dutyTitle: '24/7 solutions maximize',
      address: '15 WG/WSA Tron, Bldg 1102',
      role: { id: 3, name: 'member' },
      memberTrackingItems: [],
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
            { id: 1, name: '15th Medical Group', shortName: '15th MDG', parentId: null },
            { id: 2, name: 'organization 2', shortName: 'org 2', parentId: null },
            { id: 3, name: 'organization 3', shortName: 'org 3', parentId: 1 },
            { id: 4, name: 'organization 4', shortName: 'org 4', parentId: 1 },
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

it('renders the Dashboard page', async () => {
  const { getByText } = render(<Dashboard />);

  await waitForLoadingToFinish();

  await waitFor(() => expect(getByText(/status/i)).toBeInTheDocument());
});

it('should filter by name', async () => {
  const user = userEvent.setup();
  const screen = render(<Dashboard />);

  await waitFor(() => expect(screen.getByText(/loading/i)).toBeInTheDocument());

  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

  expect(screen.getByText(/clark, sandra/i)).toBeInTheDocument();
  expect(screen.getByText(/smith, joe/i)).toBeInTheDocument();

  const searchInput = screen.getByLabelText(/search/i);

  await user.type(searchInput, 'smith');
  expect(screen.queryByText(/clark, sandra/i)).not.toBeInTheDocument();
  expect(screen.getByText(/smith, joe/i)).toBeInTheDocument();
});

it('should filter by organization', async () => {
  const { getByText, queryByText, getByLabelText, findByText } = render(<Dashboard />);

  expect(await findByText(/clark, sandra/i)).toBeInTheDocument();
  expect(getByText(/smith, joe/i)).toBeInTheDocument();

  const searchInput = getByLabelText(/organizations/i);

  userEvent.type(searchInput, '15');

  fireEvent.click(await findByText('15th Medical Group'));

  expect(getByText(/clark, sandra/i)).toBeInTheDocument();
  expect(queryByText(/smith, joe/i)).not.toBeInTheDocument();
});

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

it('should render report widget and show correct counts', async () => {
  const screen = render(<Dashboard />);

  await waitForLoadingToFinish();

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

  expect(screen.getByText(/4 members/i)).toBeInTheDocument();
});

it('should render detailed report', async () => {
  const screen = render(<Dashboard />);

  await waitForLoadingToFinish();

  await waitFor(() => expect(screen.getByText(/readiness stats/i)).toBeInTheDocument());

  const reportButton = screen.getByRole('button', { name: /detailed report/i });

  fireEvent.click(reportButton);

  const banner = screen.getByRole('banner');

  within(banner).getByText(/detailed report/i);

  await waitForLoadingToFinish();

  const dialog = screen.getByRole('dialog');

  await waitFor(() => within(dialog).getByText(/sandra/i));

  const sandraRow = within(dialog).getByText(/sandra clark/i).parentElement?.parentNode;

  within(sandraRow).getByText(/done/i);

  const joeSmithRow = within(dialog).getByText(/joe smith/i).parentElement?.parentNode;
  within(joeSmithRow).getByText(/overdue/i);

  const firstName3Row = within(dialog).getByText(/firstname3/i).parentElement?.parentNode;
  within(firstName3Row).getByText(/upcoming/i);

  expect(within(dialog).queryByText(/firstname4/i)).not.toBeInTheDocument();

  const doneButton = screen.getByRole('button', {
    name: /done/i,
  });

  fireEvent.click(doneButton);
});
