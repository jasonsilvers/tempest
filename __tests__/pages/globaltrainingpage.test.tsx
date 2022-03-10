import TrackingItemPage, { getServerSideProps } from '../../src/pages/Trackingitems';
import { fireEvent, render, waitFor, waitForElementToBeRemoved } from '../testutils/TempestTestUtils';
import 'whatwg-fetch';
import { server, rest } from '../testutils/mocks/msw';
import { ERole, EUri } from '../../src/const/enums';
import { LoggedInUser } from '../../src/repositories/userRepo';
import { bobJones } from '../testutils/mocks/fixtures';
import { DefaultRequestBody } from 'msw';
import { getTrackingItems } from '../../src/repositories/trackingItemRepo';

import { TrackingItemsDTO } from '../../src/types';
import { mockMethodAndReturn } from '../testutils/mocks/repository';

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
      return res(ctx.status(200), ctx.json({ ...bobJones, role: { id: 0, name: ERole.ADMIN } } as LoggedInUser));
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

it('renders the tracking item page as admin an deletes trackingItem', async () => {
  const { getByText, getByRole } = render(<TrackingItemPage />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
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

  fireEvent.click(getByRole('button', { name: /delete/i }));

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

/**
 * Search tests
 */
it('test the dashboard searches for the items by title', async () => {
  const { getByText, getByRole } = render(<TrackingItemPage />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  expect(getByText(/global training/i)).toBeInTheDocument();
  await waitFor(() => getByText(/test title/i));
  const input = getByRole('textbox') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'title' } });
  expect(getByText(/test title/i)).toBeInTheDocument();
});

it('test the dashboard searches for the items by description', async () => {
  const { getByText, getByRole } = render(<TrackingItemPage />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  expect(getByText(/global training/i)).toBeInTheDocument();
  await waitFor(() => getByText(/test title/i));
  const input = getByRole('textbox') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'description' } });
  expect(getByText(/test title/i)).toBeInTheDocument();
});

test('should open then close the dialog box', async () => {
  const { getByText, getByRole, queryByText } = render(<TrackingItemPage />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  const title = getByText(/global training/i) as HTMLElement;
  expect(title).toBeInTheDocument();
  await waitFor(() => getByText(/test title/i));
  const button = getByRole('button', { name: '+ Add New' }) as HTMLButtonElement;
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
