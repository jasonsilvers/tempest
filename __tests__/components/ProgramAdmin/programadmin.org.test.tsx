import React from 'react';
import 'whatwg-fetch';
import { OrganizationList } from '../../../src/components/ProgramAdmin/OrganizationList';
import { ERole, EUri } from '../../../src/const/enums';
import { rest, server } from '../../testutils/mocks/msw';
import {
  fireEvent,
  render,
  userEvent,
  waitFor,
  waitForLoadingToFinish,
  within,
} from '../../testutils/TempestTestUtils';

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
    })
  );
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});

// // Clean up after the tests are finished.
afterAll(() => server.close());

test('should show organizations', async () => {
  const screen = render(<OrganizationList />);
  await waitForLoadingToFinish();
  expect(await screen.findByText(/15th mdg/i)).toBeInTheDocument();
});

test('should delete a organization', async () => {
  server.use(
    rest.delete(EUri.ORGANIZATIONS + '2', (req, res, context) => {
      return res(context.status(200), context.json({ message: 'ok' }));
    })
  );

  const screen = render(<OrganizationList />);

  expect(await screen.findByText(/15th mdg/i)).toBeInTheDocument();

  const row = screen.getByRole('row', {
    name: /organization 2/i,
  });

  server.use(
    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          organizations: [{ id: '1', name: '15th Medical group', shortName: '15th mdg', parentId: null }],
        })
      );
    })
  );

  const deleteButton = within(row).getByTestId('DeleteIcon');

  fireEvent.click(deleteButton);

  await waitFor(() => screen.findByText(/organization deleted/i));
});

test('should not be able to delete org with children or users', async () => {
  server.use(
    rest.delete(EUri.ORGANIZATIONS + '2', (req, res, context) => {
      return res(context.status(409), context.json({ message: 'Unable to delete org' }));
    })
  );

  const screen = render(<OrganizationList />);

  const row = await screen.findByRole('row', {
    name: /organization 2/i,
  });

  const deleteButton = within(row).getByTestId('DeleteIcon');

  fireEvent.click(deleteButton);

  await waitFor(() => screen.findByRole('alert'));
});

test('should add new organization', async () => {
  server.use(
    rest.post(EUri.ORGANIZATIONS, (req, res, context) => {
      return res(context.status(200), context.json(req.body));
    })
  );

  const screen = render(<OrganizationList />);

  const addIcon = await screen.findByTestId('AddIcon');

  fireEvent.click(addIcon);

  const closeIcon = screen.getByRole('button', {
    name: /dialog-close-button/i,
  });

  fireEvent.click(closeIcon);

  fireEvent.click(addIcon);

  const nameInput = screen.getByRole('textbox', {
    name: /name-input/i,
  });

  const shortNameInput = screen.getByRole('textbox', {
    name: /shortname/i,
  });

  const createButton = screen.getByRole('button', {
    name: /create/i,
  });

  fireEvent.click(createButton);

  expect(await screen.findByText(/"name" is not allowed to be empty/i)).toBeInTheDocument();
  expect(await screen.findByText(/"shortName" is not allowed to be empty/i)).toBeInTheDocument();

  fireEvent.change(nameInput, { target: { value: 'Test organization' } });
  fireEvent.change(shortNameInput, { target: { value: 'Test org' } });

  const orgSelect = screen.getByRole('button', {
    name: /none/i,
  });

  fireEvent.mouseDown(orgSelect);

  const option = screen.getByRole('option', {
    name: /organization 2/i,
  });

  server.use(
    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          organizations: [
            { id: '1', name: '15th Medical group', shortName: '15th mdg', parentId: null },
            { id: '2', name: 'organization 2', shortName: 'org 2', parentId: null },
            { id: '3', name: 'Test organization', shortName: 'Test org', parentId: 2 },
          ],
        })
      );
    })
  );

  fireEvent.click(option);

  fireEvent.click(createButton);

  await waitFor(() => screen.findByRole('alert'));
});

test('should allow edit organization', async () => {
  const testOrg = { id: '2', name: 'test', shortName: 'org 2', parentId: null };

  server.use(
    rest.put(EUri.ORGANIZATIONS + '2', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ testOrg }));
    })
  );
  const screen = render(<OrganizationList />);

  await waitForLoadingToFinish();

  const organizationCell = await screen.findByRole('cell', {
    name: /organization 2/i,
  });

  fireEvent.doubleClick(organizationCell);

  const input = screen.getAllByRole('textbox');

  fireEvent.change(input[0], { target: { value: test } });

  userEvent.keyboard('{Enter}');

  expect(
    screen.getByRole('cell', {
      name: /test/i,
    })
  ).toBeInTheDocument();

  await waitFor(() => screen.findByRole('alert'));

  fireEvent.doubleClick(organizationCell);

  fireEvent.change(input[0], { target: { value: '' } });

  userEvent.keyboard('{Enter}');

  await waitFor(() => screen.findByRole('alert'));
});
