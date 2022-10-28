import { render, waitFor, fireEvent, waitForLoadingToFinish } from '../testutils/TempestTestUtils';
import { rest, server } from '../testutils/mocks/msw';
import { ERole, EUri } from '../../src/const/enums';
import 'whatwg-fetch';
import React from 'react';
import Onboard from '../../src/pages/Onboard';
import WelcomePage from '../../src/pages/Welcome';
import { bobJones } from '../testutils/mocks/fixtures';
import { OrganizationType } from '@prisma/client';

const createdOrg = {
  id: 1,
  name: 'New Org',
  shortName: 'Org',
  parentId: null,
  types: [OrganizationType.CATALOG],
};

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});

beforeEach(() => {
  server.use(
    // return a user with the right permissions
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...bobJones, role: { id: 0, name: ERole.MEMBER } }));
    }),
    rest.post(EUri.ONBOARD, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(createdOrg));
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
const push = jest.fn();

describe('Onboard Page', () => {
  test('render the onboard page from Welcome page', async () => {
    const screen = render(<WelcomePage />, { push });

    await waitForLoadingToFinish();

    const onboardLink = screen.getByText(/start here/i);
    expect(onboardLink).toBeInTheDocument();
    fireEvent.click(onboardLink);

    expect(screen.getByText(/create your new org/i));
  });

  test('button should be diasabled if there is no input from user', async () => {
    const screen = render(<Onboard />);

    const button = screen.getByRole('button', { name: /create/i });

    expect(button).toBeDisabled();
  });

  test('should create new org and route to new org admin page', async () => {
    const screen = render(<Onboard />);
    const orgNameTextBox = screen.getByLabelText(/organization name/i);
    const shortNameTextBox = screen.getByLabelText(/short name/i);
    const button = screen.getByRole('button', { name: /create/i });

    fireEvent.change(orgNameTextBox, { target: { value: 'New Org' } });
    fireEvent.change(shortNameTextBox, { target: { value: 'Org' } });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    await waitFor(() => screen.findByRole('alert'));
  });

  test('should return user to prev page', async () => {
    const screen = render(<Onboard />);
    const button = screen.getByRole('button', { name: /back/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
  });
});
