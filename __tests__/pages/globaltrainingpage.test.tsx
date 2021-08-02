import TrackingItemPage from '../../src/pages/Trackingitems';
import { render } from '../utils/TempestTestUtils';
import 'whatwg-fetch';
import { server, rest } from '../utils/mocks/msw';
import { EUri } from '../../src/types/global';

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  server.resetHandlers();
});

it('renders the Dashboard page', async () => {
  server.use(
    rest.get(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ name: 'bob' }));
    })
  );

  const { getByText } = render(<TrackingItemPage />);

  expect(getByText(/Loading/i)).toBeInTheDocument();
});
