import { ERole, EUri } from '../../src/const/enums';
import { grants } from '../../src/const/grants';
import { rest, server } from '../testutils/mocks/msw';
import { fireEvent, render, waitFor, within } from '../testutils/TempestTestUtils';
import { Grant } from '@prisma/client';
import { Grants } from '../../src/components/Devtools/Grants';

import 'whatwg-fetch';
import React from 'react';

type DbGrant = Grant & { id: number };

const addIdToGrants = () => {
  const grantsWithId: DbGrant[] = [];

  const slicedGrantes = grants.slice(0, 2);

  for (let i = 0; i < slicedGrantes.length; i++) {
    const grantWithId = { ...slicedGrantes[i], id: i };

    grantsWithId.push(grantWithId);
  }

  return grantsWithId;
};

// Establish API mocking before tests.
beforeEach(() => {
  server.listen({
    onUnhandledRequest: 'warn',
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
    rest.get(EUri.PERMISSIONS, (req, res, ctx) => {
      const dbGrants = addIdToGrants();
      return res(ctx.status(200), ctx.json({ grants: dbGrants }));
    }),
    rest.get(EUri.RESOURCES, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          resources: [
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

afterAll(() => {
  server.close();
});
// // Clean up after the tests are finished.

test('should show grants and allow edit', async () => {
  server.use(
    rest.put(EUri.PERMISSIONS + '0', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...grants[0] }));
    })
  );

  const screen = render(<Grants />);

  const matterMostCell = await screen.findByRole('cell', {
    name: /mattermost/i,
  });
  fireEvent.doubleClick(matterMostCell);

  const input = screen.getAllByRole('textbox');

  fireEvent.change(input[0], { target: { value: 'test' } });

  expect(
    screen.getByRole('cell', {
      name: /test/i,
    })
  ).toBeInTheDocument();

  const profileCells = screen.getAllByRole('cell', {
    name: /profile/i,
  });

  fireEvent.click(profileCells[0]);

  const testCell = screen.getByRole('cell', {
    name: /test/i,
  });

  fireEvent.doubleClick(testCell);

  const input2 = screen.getAllByRole('textbox');

  fireEvent.change(input2[0], { target: { value: 'mattermost' } });

  fireEvent.click(profileCells[0]);
});

test('should add a grant', async () => {
  server.use(
    rest.post(EUri.PERMISSIONS, (req, res, context) => {
      const grant = req.body as unknown as Grant;
      return res(context.status(200), context.json({ ...grant, id: 1 }));
    })
  );

  const screen = render(<Grants />);

  const addNewButton = await screen.findByRole('button', {
    name: /add record/i,
  });

  fireEvent.click(addNewButton);

  expect(
    screen.getByRole('heading', {
      name: /create new grant/i,
    })
  ).toBeInTheDocument();

  const actionButton = screen.getByRole('button', {
    name: /please select an action/i,
  });

  fireEvent.mouseDown(actionButton);

  const actionOptions = await screen.findAllByRole('option');

  fireEvent.click(actionOptions[1]);

  const resourceButton = screen.getByRole('button', {
    name: /please select a resource/i,
  });

  fireEvent.mouseDown(resourceButton);

  const resourceOptions = await screen.findAllByRole('option', { name: 'admin' });

  fireEvent.click(resourceOptions[0]);

  const roleButton = screen.getByRole('button', {
    name: /please select a role/i,
  });

  fireEvent.mouseDown(roleButton);

  const adminOptions = screen.getAllByRole('option', {
    name: /monitor/i,
  });

  fireEvent.click(adminOptions[0]);

  const attrInput = screen.getByRole('textbox', {
    name: /attributes/i,
  });

  fireEvent.change(attrInput, { target: { value: '*' } });

  const addButton = screen.getByRole('button', {
    name: 'Add',
  });

  fireEvent.click(addButton);

  await waitFor(() => screen.findByRole('alert'));
});

test('should delete a grant', async () => {
  server.use(
    rest.delete(EUri.PERMISSIONS + '0', (req, res, context) => {
      return res(context.status(200), context.json({ message: 'Ok' }));
    })
  );

  const screen = render(<Grants />);

  const row = await screen.findByRole('row', {
    name: /create:any \* mattermost/i,
  });

  const deleteButton = within(row).getByRole('menuitem', {
    name: /delete/i,
  });

  fireEvent.click(deleteButton);
});
