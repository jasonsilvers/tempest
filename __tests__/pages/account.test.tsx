import React from 'react';
import 'whatwg-fetch';
import { EUri } from '../../src/const/enums';
import Accountpage from '../../src/pages/Account';
import { rest, server } from '../testutils/mocks/msw';
import { fireEvent, render, screen, userEvent, waitFor } from '../testutils/TempestTestUtils';

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

it('renders the account page', async () => {
  render(<Accountpage />);

  await waitFor(() => expect(screen.getByText(/bob jones/i)).toBeInTheDocument());
});

it('should update personal fields', async () => {
  server.use(
    rest.put(`/api/users/123`, (req, res, ctx) => {
      return res(ctx.json(req.body));
    })
  );

  render(<Accountpage />);

  await waitFor(() => expect(screen.getByText(/bob jones/i)).toBeInTheDocument());

  const firstNameInput = screen.getByRole('textbox', {
    name: /firstname/i,
  });

  const lastNameInput = screen.getByRole('textbox', {
    name: /lastname/i,
  });

  const rankSelect = await screen.findByRole('button', {
    name: 'TSgt/E-6',
  });
  const submit = screen.getByRole('button', {
    name: /update/i,
  });

  userEvent.type(firstNameInput, 'firstNameChanged');

  userEvent.type(lastNameInput, 'lastNameChanged');

  fireEvent.mouseDown(rankSelect);

  const newOption = screen.getAllByRole('option');

  fireEvent.click(newOption[2]);

  fireEvent.click(submit);

  await waitFor(() => screen.findByRole('alert'));
});

it('should update work fields', async () => {
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

    rest.put(`/api/users/123`, (req, res, ctx) => {
      return res(ctx.json(req.body));
    })
  );

  render(<Accountpage />);

  await waitFor(() => expect(screen.getByText(/bob jones/i)).toBeInTheDocument());

  const tab = screen.getByRole('tab', {
    name: /work/i,
  });

  fireEvent.click(tab);

  const dutyInput = screen.getByRole('textbox', {
    name: /dutytitle/i,
  });

  const afscInput = screen.getByRole('textbox', {
    name: /afsc/i,
  });

  userEvent.type(dutyInput, 'newDutyTitle');
  userEvent.type(afscInput, 'newAfscInput');

  await waitFor(() => screen.findByText(/test org 1/i));

  const orgSelect = screen.getByRole('button', {
    name: /test org 1/i,
  });

  fireEvent.mouseDown(orgSelect);

  const newOption = screen.getAllByRole('option');

  fireEvent.click(newOption[2]);

  const submit = screen.getByRole('button', {
    name: /update/i,
  });

  fireEvent.click(submit);

  await waitFor(() => screen.findByRole('alert'));
});
