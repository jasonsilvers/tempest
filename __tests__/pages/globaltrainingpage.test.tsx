import TrackingItemPage, { getServerSideProps } from '../../src/pages/Trackingitems';
import {
  fireEvent,
  render,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  waitForLoadingToFinish,
  within,
} from '../testutils/TempestTestUtils';
import 'whatwg-fetch';
import { server, rest } from '../testutils/mocks/msw';
import { ERole, EUri } from '../../src/const/enums';
import { LoggedInUser } from '../../src/repositories/userRepo';
import { bobJones, andrewMonitor } from '../testutils/mocks/fixtures';
import { getTrackingItems } from '../../src/repositories/trackingItemRepo';

import { mockMethodAndReturn } from '../testutils/mocks/repository';
import React from 'react';

jest.mock('../../src/repositories/trackingItemRepo.ts');

const trackingItemFromDb = {
  id: 1,
  title: 'Fire Extinguisher',
  description: 'This is a test item',
  interval: 365,
  organizationId: null,
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
      return res(ctx.status(200), ctx.json(andrewMonitor));
    }),
    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          organizations: [
            { id: 1, name: '15th Medical group', shortName: '15th mdg', parentId: null, types: ['CATALOG'] },
            { id: 2, name: 'organization 2', shortName: 'org 2', parentId: 1, types: [] },
            { id: 3, name: 'organization 3', shortName: 'org 3', parentId: 2, types: ['CATALOG'] },
            { id: 4, name: 'organization 4', shortName: 'org 4', parentId: 3, types: [] },
          ],
        })
      );
    }),

    // set up tracking items to be returned
    rest.get(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          trackingItems: [
            {
              description: 'test description',
              id: 1,
              interval: 365,
              title: '15 MDG training',
              location: 'testLocation',
              organizationId: null,
              status: 'ACTIVE',
            },
            {
              description: 'test description 2',
              id: 1,
              interval: 365,
              title: 'New training',
              location: 'testLocation 2',
              organizationId: 3,
              status: 'ACTIVE',
              _count: {
                memberTrackingItem: 2,
              },
            },
            {
              description: 'test description 2',
              id: 1,
              interval: 365,
              title: 'Inactive Training',
              location: 'testLocation 2',
              organizationId: 3,
              status: 'INACTIVE',
            },
          ],
        })
      );
    }),
    rest.post(EUri.TRACKING_ITEMS + '*', (req, res, ctx) => {
      return res(ctx.status(200));
    }),
    rest.delete(EUri.TRACKING_ITEMS + '*', (req, res, ctx) => {
      return res(ctx.status(204));
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

/**
 * Render tests
 */
it('renders the Tracking Item page', async () => {
  const { getByText } = render(<TrackingItemPage />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  expect(getByText(/global training/i)).toBeInTheDocument();
  await waitFor(() => getByText(/15 MDG training/i));
  expect(getByText(/15 MDG training/i)).toBeInTheDocument();
});

it('monitor should not be able to create training item if no orgs have catalog type', async () => {
  server.use(
    // return a user with the right permissions
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...andrewMonitor, organizationId: 4 }));
    })
  );

  const screen = render(<TrackingItemPage />);
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

  expect(
    screen.queryByRole('button', {
      name: /create/i,
    })
  ).not.toBeInTheDocument();
});

it('renders the tracking item page as admin and deletes trackingItem', async () => {
  server.use(
    // return a user with the right permissions
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...bobJones, role: { id: 0, name: ERole.ADMIN } } as LoggedInUser));
    })
  );

  const { getByText, getByRole } = render(<TrackingItemPage />);
  await waitForLoadingToFinish();
  expect(getByText(/global training/i)).toBeInTheDocument();
  await waitFor(() => getByText(/15 MDG training/i));
  expect(getByText(/15 MDG training/i)).toBeInTheDocument();

  server.use(
    rest.get(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          trackingItems: [],
        })
      );
    })
  );

  const row = getByRole('row', {
    name: /15 MDG training/i,
  });

  const button = within(row).getByTestId('DeleteIcon');

  fireEvent.click(button);

  expect(getByText(/warning!/i)).toBeInTheDocument();
  const noButton = getByRole('button', {
    name: /no/i,
  });
  fireEvent.click(noButton);

  fireEvent.click(button);

  const confirmDeleteButton = getByRole('button', {
    name: /yes/i,
  });

  fireEvent.click(confirmDeleteButton);

  await waitForElementToBeRemoved(() => getByText(/15 MDG training/i));
});

it('renders the tracking item page as user with out delete permissions', async () => {
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...bobJones, role: { id: 0, name: ERole.MEMBER } } as LoggedInUser));
    })
  );
  const { getByText, queryByRole } = render(<TrackingItemPage />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  expect(getByText(/global training/i)).toBeInTheDocument();
  await waitFor(() => getByText(/15 MDG training/i));
  expect(getByText(/15 MDG training/i)).toBeInTheDocument();

  expect(queryByRole('button', { name: /delete/i })).toBeFalsy();
});

test('monitors should see global training items and all training items of their org and children orgs', async () => {
  server.use(
    rest.get(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          trackingItems: [
            {
              description: 'test description',
              id: 8,
              interval: 365,
              title: '15 MDG training',
              location: 'testLocation',
              organizationId: null,
              status: 'ACTIVE',
            },
            {
              description: 'test description 2',
              id: 7,
              interval: 365,
              title: '15 MDG training 2',
              location: 'testLocation 2',
              organizationId: 3,
              status: 'ACTIVE',
            },
          ],
        })
      );
    }),
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      //has organization id of 1
      return res(ctx.status(200), ctx.json({ ...andrewMonitor, organizationId: 3 }));
    })
  );

  const screen = render(<TrackingItemPage />);

  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  expect(await screen.findByText(/15 MDG training/i)).toBeInTheDocument();
  expect(screen.queryByText(/15 MDG training 2/i)).not.toBeInTheDocument();

  const catalogDropdown = screen.getByRole('button', {
    name: /global training catalog/i,
  });

  fireEvent.mouseDown(catalogDropdown);

  fireEvent.click(screen.getByRole('option', { name: /organization 3/i }));

  expect(screen.queryByText('15 MDG training')).not.toBeInTheDocument();
  expect(screen.queryByText(/15 MDG training 2/i)).toBeInTheDocument();
});

test('should open then close the dialog box', async () => {
  const { getByText, getByRole, queryByText } = render(<TrackingItemPage />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  const title = getByText(/global training/i) as HTMLElement;
  expect(title).toBeInTheDocument();
  await waitFor(() => getByText(/15 MDG training/i));
  const button = getByRole('button', {
    name: /create/i,
  });
  fireEvent.click(button);
  expect(getByText(/Please create the training title/i)).toBeInTheDocument();
  fireEvent.click(getByRole('button', { name: /dialog-close-button/i }));

  expect(queryByText(/Please create the training title/i)).toBeFalsy();
});

test('should do serverside rending and return list of tracking items', async () => {
  mockMethodAndReturn(getTrackingItems, [trackingItemFromDb]);
  const value = await getServerSideProps();

  expect(value.props.dehydratedState.queries[0].state.data).toStrictEqual([trackingItemFromDb]);
});

test('should allow edit location', async () => {
  const testTrackingItem = {
    id: '2',
    title: 'test',
    description: 'training',
    interval: 365,
    location: 'trainingLocation',
    organizationId: null,
  };

  server.use(
    rest.put(EUri.TRACKING_ITEMS + '2', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ testTrackingItem }));
    })
  );
  const screen = render(<TrackingItemPage />);

  const locationCell = await screen.findByRole('cell', {
    name: /testLocation/i,
  });

  fireEvent.doubleClick(locationCell);

  const input = screen.getAllByRole('textbox');

  fireEvent.change(input[0], { target: { value: 'trainingLocation' } });

  userEvent.keyboard('{Enter}');

  expect(
    screen.getByRole('cell', {
      name: /testLocation/i,
    })
  ).toBeInTheDocument();
});

test('monitior should be able to archive training item', async () => {
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      //has organization id of 1
      return res(
        ctx.status(200),
        ctx.json({ ...andrewMonitor, organizationId: 3, role: { id: 0, name: ERole.MONITOR } })
      );
    })
  );

  const screen = render(<TrackingItemPage />);

  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

  const catalogDropdown = screen.getByRole('button', {
    name: /global training catalog/i,
  });

  fireEvent.mouseDown(catalogDropdown);

  fireEvent.click(screen.getByRole('option', { name: /organization 3/i }));

  expect(await screen.findByText(/new training/i)).toBeInTheDocument();

  const row = screen.getByRole('row', {
    name: /new training/i,
  });

  const archiveButton = within(row).getByTestId('ArchiveIcon');

  expect(archiveButton).toBeInTheDocument();

  fireEvent.click(archiveButton);

  const noButton = screen.getByRole('button', {
    name: /no/i,
  });

  fireEvent.click(noButton);

  fireEvent.click(archiveButton);

  const confirmArchiveButton = screen.getByRole('button', {
    name: /yes/i,
  });
  expect(confirmArchiveButton).toBeInTheDocument();
  fireEvent.click(confirmArchiveButton);

  await waitFor(() => screen.findByText(/training archived/i));
});

test('monitor should be able to unarchive training item', async () => {
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      //has organization id of 1
      return res(
        ctx.status(200),
        ctx.json({ ...andrewMonitor, organizationId: 3, role: { id: 0, name: ERole.MONITOR } })
      );
    })
  );

  const screen = render(<TrackingItemPage />);

  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

  const catalogDropdown = screen.getByRole('button', {
    name: /global training catalog/i,
  });

  fireEvent.mouseDown(catalogDropdown);

  fireEvent.click(screen.getByRole('option', { name: /organization 3/i }));
  const archiveTab = screen.getByRole('tab', {
    name: /archived/i,
  });
  fireEvent.click(archiveTab);
  expect(await screen.findByText(/inactive training/i)).toBeInTheDocument();
  const unarchiveButton = screen.getByTestId('UnarchiveIcon');

  expect(unarchiveButton).toBeInTheDocument();

  fireEvent.click(unarchiveButton);

  const noButton = screen.getByRole('button', {
    name: /no/i,
  });

  fireEvent.click(noButton);

  fireEvent.click(unarchiveButton);

  const yesButton = screen.getByRole('button', {
    name: /yes/i,
  });

  fireEvent.click(yesButton);

  await waitFor(() => screen.findByText(/unarchived/i));
});
