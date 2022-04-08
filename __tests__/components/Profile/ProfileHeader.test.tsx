import { Organization, Role, User } from '.prisma/client';
import * as nextRouter from 'next/router';
import 'whatwg-fetch';
import { ProfileHeader } from '../../../src/components/Profile/ProfileHeader';
import { EUri } from '../../../src/const/enums';
import { bobJones } from '../../testutils/mocks/fixtures';
import { rest, server } from '../../testutils/mocks/msw';
import { render, waitFor } from '../../testutils/TempestTestUtils';

jest.mock('../../../src/repositories/userRepo');

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
  // @ts-expect-error
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

beforeEach(() => {
  server.use(
    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.json({
          organizations: [
            { id: 1, name: 'test org 1', shortName: 'org 1' },
            { id: 2, name: 'test org 2', shortName: 'org 2' },
          ],
        })
      );
    }),
    rest.get('/api/organizations/1', (req, res, ctx) => {
      return res(ctx.json({ id: 1, name: 'test org 1', shortName: 'org 1' }));
    }),
    rest.get('/api/organizations/2', (req, res, ctx) => {
      return res(ctx.json({ id: 2, name: 'test org 2', shortName: 'org 2' }));
    })
  );
});

const bobJones2 = bobJones as User & { role: Role; organization: Organization };

it('does not render the profile header', async () => {
  const { queryByText } = render(<ProfileHeader member={null} />);
  await waitFor(() => expect(queryByText(/jones/i)).not.toBeInTheDocument());
});

it('renders the profile header', async () => {
  const { getByText } = render(<ProfileHeader member={bobJones2} />);
  await waitFor(() => expect(getByText(/jones/i)).toBeInTheDocument());
});
