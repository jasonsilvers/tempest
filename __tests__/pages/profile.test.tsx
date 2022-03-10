import { waitFor, fireEvent, rtlRender, Wrapper } from '../testutils/TempestTestUtils';
import Profile from '../../src/pages/Profile/[id]';
import 'whatwg-fetch';
import { server, rest } from '../testutils/mocks/msw';
import singletonRouter from 'next/router';

import mockRouter from 'next-router-mock';
import { andrewMonitor, bobJones } from '../testutils/mocks/fixtures';
import { EUri } from '../../src/const/enums';

jest.mock('../../src/repositories/userRepo');
jest.mock('next/router', () => require('next-router-mock'));
jest.mock('next/dist/client/router', () => require('next-router-mock'));

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
  // @ts-expect-error
  server.use(
    rest.get('/api/users/123', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(bobJones));
    })
  );
});
beforeEach(() => {
  mockRouter.setCurrentUrl('/initial');
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

it('renders the profile page with loading profile text', async () => {
  singletonRouter.push({
    query: { id: 123 },
  });
  const { getByText } = rtlRender(<Profile initialMemberData={bobJones} />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());
});

it('renders the profile page with bad permissions', async () => {
  singletonRouter.push({
    query: { id: 321 },
  });
  const { getByText } = rtlRender(<Profile />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitFor(() => getByText(/permission to view/i));
});

// MSW broke stuff
it('renders the profile page', async () => {
  singletonRouter.push({
    query: { id: 123 },
  });
  const { getByText } = rtlRender(<Profile initialMemberData={bobJones} />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitFor(() => expect(getByText(/jones/i)).toBeInTheDocument());
});

it('should not show breadcrumbs if member', async () => {
  singletonRouter.push({
    query: { id: 123 },
  });
  const { getByText, queryByText } = rtlRender(<Profile initialMemberData={bobJones} />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitFor(() => expect(getByText(/jones/i)).toBeInTheDocument());
  expect(queryByText(/dashboard/i)).not.toBeInTheDocument();
});

it('should show breadcrumbs if monitor and not on own profile', async () => {
  server.use(
    rest.get('/api/users/123', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(andrewMonitor));
    }),
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(andrewMonitor));
    })
  );
  singletonRouter.push({
    query: { id: 123 },
  });
  const { getByText, queryByText } = rtlRender(<Profile initialMemberData={bobJones} />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitFor(() => expect(getByText(/monitor/i)).toBeInTheDocument());
  expect(queryByText(/dashboard/i)).toBeInTheDocument();
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

  singletonRouter.push({
    query: { id: 123 },
  });
  const { getByText, queryByText, getByRole } = rtlRender(<Profile initialMemberData={bobJones} />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });
  await waitFor(() => expect(getByText(/loading profile/i)).toBeInTheDocument());

  await waitFor(() => expect(getByText(/jones/i)).toBeInTheDocument());
  fireEvent.click(getByText(/add new/i));

  await waitFor(() => expect(getByText(/add new training/i)).toBeInTheDocument());

  // handle close modal by clicking off the modal
  fireEvent.click(getByRole('button', { name: /dialog-close-button/i }));
  expect(queryByText(/add new training/i)).not.toBeInTheDocument();
});
