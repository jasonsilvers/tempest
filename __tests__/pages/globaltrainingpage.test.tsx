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
import { bobJones } from '../testutils/mocks/fixtures';
import { DefaultRequestBody } from 'msw';
import { getTrackingItems } from '../../src/repositories/trackingItemRepo';

import { TrackingItemsDTO } from '../../src/types';
import { mockMethodAndReturn } from '../testutils/mocks/repository';
import React from 'react';

jest.mock('../../src/repositories/trackingItemRepo.ts');

const trackingItemFromDb = {
  id: 1,
  title: 'Fire Extinguisher',
  description: 'This is a test item',
  interval: 365,
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
    rest.get<DefaultRequestBody, TrackingItemsDTO>(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          trackingItems: [
            {
              description: 'test description',
              id: 1,
              interval: 365,
              title: 'test title',
              location: 'location',
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
it('renders the Tracking Item page', async () => {
  const { getByText } = render(<TrackingItemPage />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  expect(getByText(/global training/i)).toBeInTheDocument();
  await waitFor(() => getByText(/test title/i));
  expect(getByText(/test title/i)).toBeInTheDocument();
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
    rest.get<DefaultRequestBody, TrackingItemsDTO>(EUri.TRACKING_ITEMS, (req, res, ctx) => {
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
  await waitForElementToBeRemoved(() => queryByText(/Please create the training title/i));
  expect(queryByText(/Please create the training title/i)).toBeFalsy();
});

test('should do serverside rending and return list of tracking items', async () => {
  mockMethodAndReturn(getTrackingItems, [trackingItemFromDb]);
  const value = await getServerSideProps();

  expect(value.props.dehydratedState.queries[0].state.data).toStrictEqual([trackingItemFromDb]);
});

test('should allow edit location', async () => {
  const testOrg = { id: '2', title: 'test', description: 'training', interval: 365, location: 'test location' };

  server.use(
    rest.put(EUri.TRACKING_ITEMS + '2', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ testOrg }));
    })
  );
  const screen = render(<TrackingItemPage />);

  const locationCell = await screen.findByRole('cell', {
    name: /location/i,
  });

  fireEvent.doubleClick(locationCell);

  const input = screen.getAllByRole('textbox');

  fireEvent.change(input[0], { target: { value: 'test location' } });

  userEvent.keyboard('{Enter}');

  expect(
    screen.getByRole('cell', {
      name: /test location/i,
    })
  ).toBeInTheDocument();
});
