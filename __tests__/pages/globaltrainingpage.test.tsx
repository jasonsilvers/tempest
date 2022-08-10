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
    onUnhandledRequest: 'error',
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
              title: 'test title',
              location: 'testLocation',
              organizationId: null,
            },
          ],
        })
      );
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
it.only('renders the Tracking Item page', async () => {
  const { getByText } = render(<TrackingItemPage />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  expect(getByText(/global training/i)).toBeInTheDocument();
  await waitFor(() => getByText(/test title/i));
  expect(getByText(/test title/i)).toBeInTheDocument();
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
  await waitFor(() => getByText(/test title/i));
  expect(getByText(/test title/i)).toBeInTheDocument();

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
    name: /test title/i,
  });

  const button = within(row).getByTestId('DeleteIcon');

  fireEvent.click(button);

  await waitForElementToBeRemoved(() => getByText(/test title/i));
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
  await waitFor(() => getByText(/test title/i));
  expect(getByText(/test title/i)).toBeInTheDocument();

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
              id: 1,
              interval: 365,
              title: 'test title',
              location: 'testLocation',
              organizationId: null,
            },
            {
              description: 'test description 2',
              id: 1,
              interval: 365,
              title: 'test title 2',
              location: 'testLocation 2',
              organizationId: 3,
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
  expect(await screen.findByText(/test title/i)).toBeInTheDocument();
  expect(screen.queryByText(/test title 2/i)).not.toBeInTheDocument();

  const catalogDropdown = screen.getByRole('button', {
    name: /global training catalog/i,
  });

  fireEvent.mouseDown(catalogDropdown);

  fireEvent.click(screen.getByRole('option', { name: /organization 3/i }));

  expect(screen.queryByText('test title')).not.toBeInTheDocument();
  expect(screen.queryByText(/test title 2/i)).toBeInTheDocument();
});

test('should open then close the dialog box', async () => {
  const { getByText, getByRole, queryByText } = render(<TrackingItemPage />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  const title = getByText(/global training/i) as HTMLElement;
  expect(title).toBeInTheDocument();
  await waitFor(() => getByText(/test title/i));
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
