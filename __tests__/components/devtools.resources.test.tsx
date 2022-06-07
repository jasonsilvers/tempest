import { Resources } from '../../src/components/Devtools/Resources';
import { ERole, EUri } from '../../src/const/enums';
import { rest, server } from '../testutils/mocks/msw';
import { render, waitForLoadingToFinish } from '../testutils/TempestTestUtils';

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
