import { Resources } from '../../src/components/Devtools/Resources';
import { ERole, EUri } from '../../src/const/enums';
import { rest, server } from '../testutils/mocks/msw';
import { fireEvent, render, waitFor, waitForLoadingToFinish, within } from '../testutils/TempestTestUtils';

beforeEach(() => {
  server.listen({
    onUnhandledRequest: 'error',
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
          resource: [
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

  await waitForLoadingToFinish();

  const resouceCell = screen.getByRole('cell', {
    name: /admin/i,
  });
  await expect(resouceCell).toBeInTheDocument();
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

  expect(
    screen.getByRole('heading', {
      name: /create new resource/i,
    })
  ).toBeInTheDocument();

  const resourceInputField = screen.getByRole('textbox', {
    name: /name/i,
  });
  const resourceInputTestValue = 'test';

  fireEvent.change(resourceInputField, { target: { value: resourceInputTestValue } });

  const addResourceButtton = await screen.getByTestId('testIdButton');

  fireEvent.click(addResourceButtton);

  await waitFor(() => screen.findByText(/resource added!/i));
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

  await waitFor(() => screen.getByText(/resource deleted/i));
});
