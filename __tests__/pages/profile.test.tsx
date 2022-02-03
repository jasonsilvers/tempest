import { render, waitFor, fireEvent } from '../testutils/TempestTestUtils';
import Profile, { getStaticPaths, getStaticProps } from '../../src/pages/Profile/[id]';
import 'whatwg-fetch';
import { server, rest } from '../testutils/mocks/msw';
import * as nextRouter from 'next/router';
import { mockMethodAndReturn } from '../testutils/mocks/repository';
import { findUserByIdWithMemberTrackingItems, UserWithAll } from '../../src/repositories/userRepo';

jest.mock('../../src/repositories/userRepo');
import { bobJones } from '../testutils/mocks/fixtures';
import { EUri } from '../../src/const/enums';

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
  // @ts-expect-error
  nextRouter.useRouter = jest.fn();
  server.use(
    rest.get('/api/users/123', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(bobJones));
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

const mockUseRouter = (config) => {
  //@ts-expect-error
  nextRouter.useRouter.mockImplementation(() => config);
};

it('renders the profile page with loading profile text', async () => {
  mockUseRouter({ query: { id: '123' } });
  const { getByText } = render(<Profile initialMemberData={bobJones} />);
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());
});

it('renders the profile page with bad permissions', async () => {
  mockUseRouter({ query: { id: '321' } });
  const { getByText } = render(<Profile />);
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitFor(() => getByText(/permission to view/i));
});

// MSW broke stuff
it('renders the profile page', async () => {
  mockUseRouter({ query: { id: 123 } });
  const { getByText } = render(<Profile initialMemberData={bobJones} />);
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitFor(() => expect(getByText(/jones/i)).toBeInTheDocument());
});

it('renders opens the dialog modal', async () => {
  server.use(
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

  mockUseRouter({ query: { id: 123 } });
  const { getByText, queryByText, getByRole } = render(<Profile initialMemberData={bobJones} />);
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitFor(() => expect(getByText(/jones/i)).toBeInTheDocument());
  fireEvent.click(getByText(/add new/i));
  await waitFor(() => expect(getByText(/add new training/i)).toBeInTheDocument());

  // handle close modal by clicking off the modal
  fireEvent.click(getByRole('button', { name: /dialog-close-button/i }));
  expect(queryByText(/add new training/i)).not.toBeInTheDocument();
});

// next functions

it('test get static paths', async () => {
  const result = await getStaticPaths();
  expect(result).toStrictEqual({ paths: [], fallback: true });
});

it('test get static props', async () => {
  mockMethodAndReturn(findUserByIdWithMemberTrackingItems, {} as Partial<UserWithAll>);
  const result = await getStaticProps({ params: { id: '123' } });
  expect(result.revalidate).toEqual(30);
  expect(result.props.dehydrateState.mutations).toStrictEqual([]);
});
