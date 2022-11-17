
import React from 'react';
import 'whatwg-fetch';
import { ERole, EUri } from '../../src/const/enums';
import { bobJones } from '../testutils/mocks/fixtures';
import { rest, server } from '../testutils/mocks/msw';
import { fireEvent, render, waitFor } from '../testutils/TempestTestUtils';
import { MergeAccount } from '../../src/components/MergeAccount';


beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});

beforeEach(() => {
  server.use(
    // return a user with the right permissions
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...bobJones, role: { id: 2, name: ERole.ADMIN } }));
    }),
    rest.post(EUri.MERGE, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({'message' : 'ok'}));
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

describe('Merge Account', () => {
  test('Should Open Merge dialog', async () => {
    const screen = render(<Onboard />);

    const button = screen.getByRole('button', { name: /create/i });

    expect(button).toBeDisabled();
  });

  test('should merge accont', async () => {
    const screen = render(<MergeAccount />);
    const orgNameTextBox = screen.getByLabelText(/organization name/i);
    const shortNameTextBox = screen.getByLabelText(/short name/i);
    const button = screen.getByRole('button', { name: /create/i });

    fireEvent.change(orgNameTextBox, { target: { value: 'New Org' } });
    fireEvent.change(shortNameTextBox, { target: { value: 'Org' } });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    await waitFor(() => screen.findByRole('alert'));
  });

});
