import { render, waitFor, waitForElementToBeRemoved, fireEvent } from '../utils/TempestTestUtils';
import Profile, { getStaticPaths, getStaticProps } from '../../src/pages/Profile/[id]';
import 'whatwg-fetch';
import { server } from '../utils/mocks/msw';
import * as nextRouter from 'next/router';

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
  // @ts-expect-errore
  nextRouter.useRouter = jest.fn();
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
  const { getByText } = render(<Profile />);
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());
});

it('renders the profile page with bad permissions', async () => {
  mockUseRouter({ query: { id: '321' } });
  const { getByText } = render(<Profile />);
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitForElementToBeRemoved(() => getByText(/loading profile/i));
  await waitFor(() => getByText(/permission to view/i));
});

// MSW broke stuff
it('renders the profile page', async () => {
  mockUseRouter({ query: { id: '123' } });
  const { getByText } = render(<Profile />);
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitForElementToBeRemoved(() => getByText(/loading profile/i));
  await waitFor(() => expect(getByText(/jones bob/i)).toBeInTheDocument());
});

it('renders the opens the dialog modal', async () => {
  mockUseRouter({ query: { id: '123' } });
  const { getByText, queryByText } = render(<Profile />);
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitForElementToBeRemoved(() => getByText(/loading profile/i));
  await waitFor(() => expect(getByText(/jones bob/i)).toBeInTheDocument());
  fireEvent.click(getByText(/add new/i));
  await waitFor(() => expect(getByText(/add new training/i)).toBeInTheDocument());

  // handle close modal by clicking off the modal
  fireEvent.click(getByText(/close/i));
  expect(queryByText(/add new training/i)).not.toBeInTheDocument();
});

// next functions

it('test get static paths', async () => {
  const result = await getStaticPaths();
  expect(result).toStrictEqual({ paths: [], fallback: true });
});

it('test get static props', async () => {
  const result = await getStaticProps({ params: { id: '123' } });

  expect(result).toStrictEqual({ props: { dehydrateState: { mutations: [], queries: [] } }, revalidate: 30 });
});
