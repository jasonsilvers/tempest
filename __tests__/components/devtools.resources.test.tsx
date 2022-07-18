import { Resources } from '../../src/components/Devtools/Resources';
import { ERole, EUri } from '../../src/const/enums';
import { rest, server } from '../testutils/mocks/msw';
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

beforeEach(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });

  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
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

    rest.get(EUri.RESOURCES, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          resources: [
            { id: 1, name: 'admin' },
            { id: 2, name: 'dashboard' },
          ],
        })
      );
    })
  );
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});
// Clean up after the tests are finished.
afterAll(() => server.close());

test('should render resources component and show list of resources', async () => {
  const screen = render(<Resources />);

  expect(await screen.findByText(/admin/i)).toBeInTheDocument();
});

test('should add resource', async () => {
  server.use(
    rest.post(EUri.RESOURCES, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ name: 'test' }));
    })
  );

  const screen = render(<Resources />);

  await waitForLoadingToFinish();

  const addNewButton = screen.getByTestId('AddIcon');

  fireEvent.click(addNewButton);

  userEvent.keyboard('{Escape}');

  await waitForElementToBeRemoved(() => screen.getByRole('dialog'));

  fireEvent.click(addNewButton);

  expect(
    screen.getByRole('heading', {
      name: /create new resource/i,
    })
  ).toBeInTheDocument();

  const addResourceButton = screen.getByRole('button', { name: 'Add' });

  fireEvent.click(addResourceButton);

  await screen.findByText(/"name" contains an invalid value/i);

  const resourceSelectField = screen.getByRole('button', {
    name: /please select a resource/i,
  });

  expect(resourceSelectField).toBeInTheDocument();

  fireEvent.mouseDown(resourceSelectField);

  const options = screen.getAllByRole('option');

  fireEvent.click(options[1]);

  fireEvent.click(addResourceButton);

  await waitFor(() => screen.getByRole('alert'));
});

test('should delete a resouce', async () => {
  server.use(
    rest.delete(EUri.RESOURCES + '1', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ message: 'ok' }));
    })
  );
  const screen = render(<Resources />);

  await waitForLoadingToFinish();

  const row = await screen.findByRole('row', {
    name: /1 admin/i,
  });

  const deleteButton = within(row).getByTestId('DeleteIcon');

  fireEvent.click(deleteButton);

  await waitFor(() => screen.getByRole('alert'));
});
