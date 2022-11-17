import React from 'react';
import 'whatwg-fetch';
import { ERole, EUri } from '../../src/const/enums';
import { bobJones } from '../testutils/mocks/fixtures';
import { rest, server } from '../testutils/mocks/msw';
import { fireEvent, render, waitFor, waitForLoadingToFinish } from '../testutils/TempestTestUtils';
import { MergeAccount } from '../../src/components/Devtools/MergeAccount';

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
      return res(ctx.status(200), ctx.json({ message: 'ok' }));
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
  test('should merge accont', async () => {
    const screen = render(<MergeAccount isOpen={true} setIsOpen={() => true} />);
    const winnerAccountTextBox = screen.getByLabelText(/winnerAccount/i);
    const loserAccountTextTextBox = screen.getByLabelText(/loserAccount/i);
    const button = screen.getByRole('button', { name: /merge/i });

    fireEvent.change(winnerAccountTextBox, { target: { value: 'test@email.com' } });
    fireEvent.change(loserAccountTextTextBox, { target: { value: 'test2@gmail.com' } });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    await waitFor(() => screen.findByRole('alert'));
  });
});
