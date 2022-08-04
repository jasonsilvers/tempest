import { bobJones, andrewMonitor } from '../testutils/mocks/fixtures';
import { rest, server } from '../testutils/mocks/msw';
import mockRouter from 'next-router-mock';
import singletonRouter from 'next/router';
import { rtlRender, waitFor, Wrapper } from '../testutils/TempestTestUtils';
import React from 'react';
import 'whatwg-fetch';

import Archive, { getServerSideProps } from '../../src/pages/Profile/[id]/Archive';
import { mockMethodAndReturn } from '../testutils/mocks/repository';
import { findUserById } from '../../src/repositories/userRepo';
import { GetServerSidePropsContext } from 'next';

jest.mock('../../src/repositories/userRepo');
jest.mock('next/router', () => require('next-router-mock'));
jest.mock('next/dist/client/router', () => require('next-router-mock'));

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
  server.use(
    rest.get('/api/users/123', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(bobJones));
    }),
    rest.get('/api/users/321', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(andrewMonitor));
    }),
    rest.get('/api/users/123/membertrackingitems/in_progress', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(andrewMonitor));
    })
  );
});
beforeEach(() => {
  mockRouter.setCurrentUrl('/initial');
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  jest.clearAllMocks();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

it('renders the profile page with loading profile text', async () => {
  singletonRouter.push({
    query: { id: 123 },
  });

  const screen = rtlRender(<Archive initialMemberData={bobJones} />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });
  await waitFor(() => expect(screen.getByText(/bob jones/i)).toBeInTheDocument());
});

test('should do serverside rending and return user', async () => {
  const user = {
    id: 1,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  };

  mockMethodAndReturn(findUserById, user);
  const value = await getServerSideProps({ context: { params: { id: 1 } } } as unknown as GetServerSidePropsContext);

  expect(value.props.initialMemberData).toStrictEqual(user);
});
