import { JobStatus } from '@prisma/client';
import { rest, server } from '../../testutils/mocks/msw';
import { fireEvent, render, userEvent } from '../../testutils/TempestTestUtils';
import { MassAssign } from '../../../src/components/Dashboard/MassAssign';
import { EUri } from '../../../src/const/enums';
import { usersQuery } from '../../testutils/mocks/fixtures';

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

  userEvent.keyboard('{Escape}');

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
