import TrackingItemPage, { getStaticProps } from '../../src/pages/Trackingitems';
import { fireEvent, render, waitFor, waitForElementToBeRemoved } from '../utils/TempestTestUtils';
import 'whatwg-fetch';
import { server, rest } from '../utils/mocks/msw';
import { ERole, EUri } from '../../src/types/global';
import { LoggedInUser } from '../../src/repositories/userRepo';
import { bobJones } from '../utils/mocks/fixtures';
import { TrackingItem } from '@prisma/client';

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
            },
          ] as TrackingItem[],
        })
      );
    })
  );
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  server.resetHandlers();
});

/**
 * Render tests
 */
it('renders the Dashboard page', async () => {
  const { getByText } = render(<TrackingItemPage />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  expect(getByText(/global training/i)).toBeInTheDocument();
  await waitFor(() => getByText(/test title/i));
  expect(getByText(/test title/i)).toBeInTheDocument();
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

it('test the dashboard cancels the search', async () => {
  const { getByText, getByRole } = render(<TrackingItemPage />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  expect(getByText(/global training/i)).toBeInTheDocument();
  await waitFor(() => getByText(/test title/i));
  const input = getByRole('textbox') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'description' } });
  const clearButton = getByRole('clearButton') as HTMLButtonElement;
  fireEvent.click(clearButton);
  expect(input.value).toBe('');
  expect(getByText(/test title/i)).toBeInTheDocument();
});

/**
 * getStaticProps Test
 */

test('should return props for static props with no prisma', async () => {
  const { props } = await getStaticProps();

  console.log(props.dehydrateState.queries[0]);

  expect(props.dehydrateState.queries[0].state.data).toEqual([]);
  expect(props.dehydrateState.queries[0].queryKey).toEqual(['trackingitems']);
});
