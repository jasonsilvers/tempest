import { fireEvent, render, waitForElementToBeRemoved } from '../utils/TempestTestUtils';
import { Devtools } from '../../src/components/Devtools';
import { server } from '../utils/mocks/msw';
import { rest } from 'msw';
import { ERole } from '../../src/types/global';

import 'whatwg-fetch';

// Establish API mocking before tests.
beforeEach(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });

  server.use(
    rest.get('/api/login', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: '123',
          firstName: 'bob',
          lastName: 'jones',
          role: { id: 22, name: ERole.ADMIN },
        })
      );
    }),

    rest.get('/api/users', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([
          {
            id: '123',
            firstName: 'bob',
            lastName: 'jones',
            organizationId: '1',
            role: { id: 22, name: ERole.ADMIN },
          },
        ])
      );
    }),

    rest.get('/api/roles', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json([{ id: 22, name: ERole.ADMIN }]));
    }),
    rest.get('/api/organizations', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json([{ id: '1', name: '15th MDG', parentId: null }]));
    })
  );
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

test('should render devtools', async () => {
  const { getByText, findByRole } = render(<Devtools />);

  const button = await findByRole('button', { name: 'devtool-button' });
  fireEvent.click(button);
  expect(getByText(/loading users/i)).toBeInTheDocument();
});

test('should show list of users', async () => {
  const { getByText, findByRole } = render(<Devtools />);

  const button = await findByRole('button', { name: 'devtool-button' });
  fireEvent.click(button);

  await waitForElementToBeRemoved(() => getByText(/loading users/i));
  expect(getByText(/bob jones/i)).toBeInTheDocument();
});

test('should close devtools', async () => {
  const { getByText, findByRole } = render(<Devtools />);

  const devToolsButton = await findByRole('button', { name: 'devtool-button' });
  fireEvent.click(devToolsButton);

  await waitForElementToBeRemoved(() => getByText(/loading users/i));
  expect(getByText(/bob jones/i)).toBeInTheDocument();
  const closeButton = getByText(/close/i);
  fireEvent.click(closeButton);
  await waitForElementToBeRemoved(() => getByText(/users/i));
});
