import { render, waitFor, fireEvent, waitForLoadingToFinish } from '../utils/TempestTestUtils';
import WelcomePage from '../../src/pages/Welcome';
import { rest, server } from '../utils/mocks/msw';
import { ERole, EUri } from '../../src/const/enums';
import { bobJones } from '../utils/mocks/fixtures';

import 'whatwg-fetch';

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});

beforeEach(() => {
  server.use(
    // return a user with the right permissions
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...bobJones, role: { id: 0, name: ERole.MONITOR } }));
    }),
    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          organizations: [
            { id: 'a2147994-d964-40a9-985b-0f4381828de8', name: '15th MDG', parentId: null },
            {
              id: 'f41f92d8-3920-4c33-9470-e2c1c6623abb',
              name: 'Dental Squadron',
              parentId: 'a2147994-d964-40a9-985b-0f4381828de8',
            },
            {
              id: '67c6657f-0022-48b0-89b3-866dd89831ef',
              name: 'Vaccinations Squadron',
              parentId: 'a2147994-d964-40a9-985b-0f4381828de8',
            },
          ],
        })
      );
    })
  );
});

afterAll(() => {
  server.close();
  jest.clearAllMocks();
});

afterEach(() => {
  server.resetHandlers();
});

it('renders the welcome page', async () => {
  const { getByText } = render(<WelcomePage />);
  await waitFor(() => expect(getByText(/loading/i)).toBeInTheDocument());
});

it('should disable Get Started button if no organization id', async () => {
  const { getByText, getByRole } = render(<WelcomePage />);
  await waitFor(() => expect(getByText(/loading/i)).toBeInTheDocument());

  const button = getByRole('button', { name: /get started/i });

  expect(button).toBeDisabled();
});

it('should route to index when clicking get started', async () => {
  server.use(
    // return a user with the right permissions
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          ...bobJones,
          rank: 'ssg',
          role: { id: 0, name: ERole.MONITOR },
          organizationId: 'a2147994-d964-40a9-985b-0f4381828de8',
        })
      );
    })
  );
  const push = jest.fn();

  const { getByRole } = render(<WelcomePage />, { push });
  const button = getByRole('button', { name: /get started/i });

  await waitForLoadingToFinish();

  expect(button).toBeEnabled();

  fireEvent.click(button);

  expect(push).toBeCalledTimes(1);
  expect(push).toBeCalledWith('/');
});
