import React from 'react';
import 'whatwg-fetch';
import { ERole, EUri } from '../../src/const/enums';
import { bobJones } from '../testutils/mocks/fixtures';
import { rest, server } from '../testutils/mocks/msw';
import { fireEvent, render, waitFor, waitForLoadingToFinish } from '../testutils/TempestTestUtils';
import { MergeAccount } from '../../src/components/Devtools/MergeAccount';
import { getUsers } from '../../src/repositories/userRepo';

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

beforeEach(() => {
  getUsers(),
  server.use(
    // return a user with the right permissions
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...bobJones, role: { id: 2, name: ERole.ADMIN } }));
    }),
    rest.post(EUri.MERGE, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ message: 'ok' }));
    }),
    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          organizations: [
            { id: '1', name: '15th Medical group', shortName: '15th mdg', parentId: null },
            { id: '2', name: 'organization 2', shortName: 'org 2', parentId: null },
          ],
        })
      );
    }),
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
    const winnerAccountTextBox = screen.getByRole('combobox', {name: /winnerAccount/i});
    const loserAccountTextBox = screen.getByRole('combobox', {name: /loser account/i});
    const button = screen.getByRole('button', { name: /merge/i });

    fireEvent.change(winnerAccountTextBox, { target: { value: 'test@email.com' } });
    fireEvent.change(loserAccountTextBox, { target: { value: 'test2@gmail.com' } });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    await waitFor(() => screen.findByRole('alert'));
  });
});
