import { rest, server } from '../testutils/mocks/msw';
import 'whatwg-fetch';
import PpePage from '../../src/pages/Ppe';
import { fireEvent, render, waitFor } from '../testutils/TempestTestUtils';

jest.mock('lodash.debounce', () => jest.fn((fn) => fn));

const testPPEItem = {
  id: 1,
  name: 'Steel Toe',
  provided: true,
  providedDetails: 'random details',
  inUse: false,
  inUseDetails: 'not in use',
  userId: 5,
};

const testPPEItem2 = {
  id: 1,
  name: 'gas mask',
  provided: true,
  providedDetails: 'in kinda smells',
  inUse: false,
  inUseDetails: 'i like it',
  userId: 5,
};

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

beforeEach(() => {
  server.use(
    rest.get('/api/ppeitems/', (req, res, ctx) => {
      return res(
        ctx.json({
          ppeItems: [testPPEItem, testPPEItem2],
        })
      );
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
  const screen = render(<PpePage />);

  await waitFor(() => expect(screen.getByText(/bob jones/i)).toBeInTheDocument());

  await waitFor(() => expect(screen.getByDisplayValue(/steel toe/i)).toBeInTheDocument());
});

it('Can add new PPE Item', async () => {
  server.use(
    rest.post('/api/ppeitems', (req, res, ctx) => {
      return res(ctx.json(req.body));
    })
  );
  const screen = render(<PpePage />);

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
  const screen = render(<PpePage />);

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
  const screen = render(<PpePage />);

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
  const screen = render(<PpePage />);

  await waitFor(() => expect(screen.getByText(/bob jones/i)).toBeInTheDocument());

  await waitFor(() => expect(screen.getByDisplayValue(/steel toe/i)).toBeInTheDocument());

  const addButton = screen.getByTestId('AddIcon');

  fireEvent.click(addButton);

  const deleteButtons = screen.getAllByRole('button', { name: 'delete' });

  fireEvent.click(deleteButtons[2]);
});
