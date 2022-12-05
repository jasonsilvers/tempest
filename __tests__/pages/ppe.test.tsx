import mockRouter from 'next-router-mock';
import singletonRouter from 'next/router';
import React from 'react';
import 'whatwg-fetch';
import PpePage from '../../src/pages/Tempest/Ppe/[id]';
import { bobJones } from '../testutils/mocks/fixtures';
import { rest, server } from '../testutils/mocks/msw';
import { fireEvent, rtlRender, waitFor, Wrapper } from '../testutils/TempestTestUtils';

jest.mock('lodash.debounce', () => jest.fn((fn) => fn));
jest.mock('next/router', () => require('next-router-mock'));
jest.mock('next/dist/client/router', () => require('next-router-mock'));

const testPPEItem = {
  id: 1,
  name: 'Steel Toe',
  provided: true,
  inUse: false,
  userId: 5,
};

const testPPEItem2 = {
  id: 1,
  name: 'gas mask',
  provided: true,
  inUse: false,
  userId: 5,
};

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

beforeEach(() => {
  mockRouter.setCurrentUrl('/initial');
  singletonRouter.push({
    query: { id: 123 },
  });
  server.use(
    rest.get('/api/ppeitems', (req, res, ctx) => {
      return res(
        ctx.json({
          ppeItems: [testPPEItem, testPPEItem2],
        })
      );
    }),
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

it('renders the ppe page', async () => {
  const screen = rtlRender(<PpePage />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });

  await waitFor(() => expect(screen.getByText(/bob jones/i)).toBeInTheDocument());

  await waitFor(() => expect(screen.getByDisplayValue(/steel toe/i)).toBeInTheDocument());
});

it('Can add new PPE Item', async () => {
  server.use(
    rest.post('/api/ppeitems', (req, res, ctx) => {
      return res(ctx.json(req.body));
    })
  );
  const screen = rtlRender(<PpePage />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });

  await waitFor(() => expect(screen.getByText(/bob jones/i)).toBeInTheDocument());

  await waitFor(() => expect(screen.getByDisplayValue(/steel toe/i)).toBeInTheDocument());

  const addButton = screen.getByTestId('AddIcon');

  fireEvent.click(addButton);

  const nameInput = screen.getAllByRole('textbox', {
    name: /name/i,
  });

  fireEvent.change(nameInput[2], { target: { value: 'new ppe item' } });

  await waitFor(() => screen.getByRole('alert'));
});

it('Can update ppe item', async () => {
  server.use(
    rest.put('/api/ppeitems/1', (req, res, ctx) => {
      return res(ctx.json(req.body));
    })
  );
  const screen = rtlRender(<PpePage />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });

  await waitFor(() => expect(screen.getByText(/bob jones/i)).toBeInTheDocument());

  await waitFor(() => expect(screen.getByDisplayValue(/steel toe/i)).toBeInTheDocument());

  const addButton = screen.getByTestId('AddIcon');

  fireEvent.click(addButton);

  const nameInput = screen.getAllByRole('textbox', {
    name: /name/i,
  });

  fireEvent.change(nameInput[1], { target: { value: 'updated ppe item' } });

  await waitFor(() => screen.getByRole('alert'));
});

it('Can delete ppe item', async () => {
  server.use(
    rest.delete('/api/ppeitems/1', (req, res, ctx) => {
      return res(ctx.json(req.body));
    })
  );
  const screen = rtlRender(<PpePage />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });

  await waitFor(() => expect(screen.getByText(/bob jones/i)).toBeInTheDocument());

  await waitFor(() => expect(screen.getByDisplayValue(/steel toe/i)).toBeInTheDocument());

  const deleteButtons = screen.getAllByRole('button', { name: 'delete' });

  fireEvent.click(deleteButtons[0]);

  await waitFor(() => screen.getByRole('alert'));
});

it('Can remove new ppe item before saving', async () => {
  server.use(
    rest.delete('/api/ppeitems/1', (req, res, ctx) => {
      return res(ctx.json(req.body));
    })
  );
  const screen = rtlRender(<PpePage />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });

  await waitFor(() => expect(screen.getByText(/bob jones/i)).toBeInTheDocument());

  await waitFor(() => expect(screen.getByDisplayValue(/steel toe/i)).toBeInTheDocument());

  const addButton = screen.getByTestId('AddIcon');

  fireEvent.click(addButton);

  const deleteButtons = screen.getAllByRole('button', { name: 'delete' });

  fireEvent.click(deleteButtons[2]);
});

it('Can only add one new item at a time', async () => {
  server.use(
    rest.delete('/api/ppeitems/1', (req, res, ctx) => {
      return res(ctx.json(req.body));
    })
  );
  const screen = rtlRender(<PpePage />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });

  await waitFor(() => expect(screen.getByText(/bob jones/i)).toBeInTheDocument());

  await waitFor(() => expect(screen.getByDisplayValue(/steel toe/i)).toBeInTheDocument());

  const addButton = screen.getByTestId('AddIcon');

  fireEvent.click(addButton);

  const inputs = screen.getAllByPlaceholderText(/enter title/i);

  expect(inputs).toHaveLength(3);

  expect(
    screen.getByRole('button', {
      name: /add-button/i,
    })
  ).toBeDisabled();
});
