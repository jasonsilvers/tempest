import { render, waitFor, fireEvent, waitForElementToBeRemoved } from '../../utils/TempestTestUtils';
import 'whatwg-fetch';
import { server, rest } from '../../utils/mocks/msw';
import * as nextRouter from 'next/router';
import { ProfileHeader } from '../../../src/components/Profile/ProfileHeader';

jest.mock('../../../src/repositories/userRepo');
import { bobJones } from '../../utils/mocks/fixtures';
import { ERole, EUri } from '../../../src/types/global';

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
            { id: 1, name: 'test org 1' },
            { id: 2, name: 'test org 2' },
          ],
        })
      );
    }),
    rest.get('/api/organizations/1', (req, res, ctx) => {
      return res(ctx.json({ id: 1, name: 'test org 1' }));
    }),
    rest.get('/api/organizations/2', (req, res, ctx) => {
      return res(ctx.json({ id: 2, name: 'test org 2' }));
    })
  );
});

it('does not render the profile header', async () => {
  const { queryByText } = render(<ProfileHeader role={ERole.MEMBER} user={null} />);
  await waitFor(() => expect(queryByText(/jones/i)).not.toBeInTheDocument());
});

it('renders the profile header', async () => {
  const { getByText } = render(<ProfileHeader role={ERole.MEMBER} user={bobJones} />);
  await waitFor(() => expect(getByText(/jones/i)).toBeInTheDocument());
});

it('renders the edit view in the profile header and edits the rank drop down', async () => {
  const { getByText, getByRole, getByLabelText, queryByText, findAllByRole } = render(
    <ProfileHeader role={ERole.MEMBER} user={bobJones} />
  );
  const startingRank = bobJones.rank;
  await waitFor(() => expect(getByRole(/button/i, { name: 'edit-user' })).toBeInTheDocument());

  fireEvent.click(getByRole(/button/i, { name: 'edit-user' }));
  await waitFor(() => expect(getByText(/save/i)).toBeInTheDocument());
  // change data
  const textfield = getByLabelText(/rank/i, { selector: 'input' }) as HTMLInputElement;
  // get value of textfield before change event
  fireEvent.mouseDown(textfield);
  const options = await findAllByRole('option');
  fireEvent.click(options[1]);

  await waitFor(() => expect(textfield.value).toBe('Amn/E-2'));
  // exits the edit mode with out persisting data
  fireEvent.click(getByText(/cancel/i));
  await waitFor(() => expect(queryByText('Amn/E-2')).not.toBeInTheDocument());
  await waitFor(() => expect(getByText(startingRank)).toBeInTheDocument());
});

it('renders the edit view in the profile header and edits the org drop down', async () => {
  const { getByText, getByRole, getByLabelText, queryByText, findAllByRole } = render(
    <ProfileHeader role={ERole.MEMBER} user={bobJones} />
  );

  server.use(
    rest.put(`/api/users/123`, (req, res, ctx) => {
      return res(ctx.json(req.body));
    })
  );

  await waitFor(() => expect(getByRole(/button/i, { name: 'edit-user' })).toBeInTheDocument());
  fireEvent.click(getByRole(/button/i, { name: 'edit-user' }));
  await waitFor(() => expect(getByText(/save/i)).toBeInTheDocument());
  // change data
  await waitForElementToBeRemoved(() => getByText(/test org 1/i));
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  const textfield = getByLabelText(/organization/i, { selector: 'input' }) as HTMLInputElement;
  // get value of textfield before change event
  fireEvent.mouseDown(textfield);
  const options = await findAllByRole('option');
  fireEvent.click(options[1]);

  await waitFor(() => expect(textfield.value).toBe('test org 2'));
  // exits the edit mode with out persisting data
  fireEvent.click(getByText(/save/i));
  await waitFor(() => expect(queryByText('test org 2')).not.toBeInTheDocument());
});

it('renders the edit view in the profile header and persists data', async () => {
  server.use(
    rest.put(`/api/users/123`, (req, res, ctx) => {
      return res(ctx.json(req.body));
    })
  );

  const { getByText, getByRole, getByLabelText, queryByText } = render(
    <ProfileHeader user={bobJones} role={ERole.MEMBER} />
  );
  await waitFor(() => expect(getByRole(/button/i, { name: 'edit-user' })).toBeInTheDocument());

  fireEvent.click(getByRole(/button/i, { name: 'edit-user' }));
  await waitFor(() => expect(getByText(/save/i)).toBeInTheDocument());
  // change data
  const afsctextfield = getByLabelText(/afsc/i, { selector: 'input' }) as HTMLInputElement;
  const addresstextfield = getByLabelText(/office/i, { selector: 'input' }) as HTMLInputElement;
  fireEvent.change(afsctextfield, { target: { value: 'AFSC123' } });
  fireEvent.change(addresstextfield, { target: { value: 'OFFICESYMBOL123' } });
  fireEvent.click(getByText(/save/i));
  await waitFor(() => expect(queryByText('AFSC123')).toBeInTheDocument());
  await waitFor(() => expect(queryByText('OFFICESYMBOL123')).toBeInTheDocument());
});
