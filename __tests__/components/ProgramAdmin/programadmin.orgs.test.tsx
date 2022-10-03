import React from 'react';
import 'whatwg-fetch';
import { OrganizationList } from '../../../src/components/ProgramAdmin/OrganizationList';
import { ERole, EUri } from '../../../src/const/enums';
import { bobJones } from '../../testutils/mocks/fixtures';
import { rest, server } from '../../testutils/mocks/msw';
import {
  fireEvent,
  render,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  waitForLoadingToFinish,
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
          organizationId: 1,
          role: { id: 22, name: ERole.ADMIN },
        })
      );
    }),
    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          organizations: [
            { id: 1, name: '15th Medical group', shortName: '15th mdg', parentId: null, types: [] },
            { id: 2, name: 'organization 2', shortName: 'org 2', parentId: 1, types: ['CATALOG'] },
          ],
        })
      );
    }),
    rest.get(EUri.ORGANIZATIONS + '2', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: '2',
          name: 'organization 2',
          shortName: 'org 2',
          parentId: null,
          types: ['CATALOG'],
          children: [],
          users: [],
        })
      );
    }),
    rest.get(EUri.ORGANIZATIONS + '1', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: '1',
          name: '15th Medical group',
          shortName: '15th mdg',
          parentId: null,
          types: [],
          children: [{ id: '2', name: 'organization 2', shortName: 'org 2', parentId: null, types: [] }],
          users: [bobJones],
        })
      );
    })
  ),
    rest.delete(EUri.ORGANIZATIONS + '2', (req, res, context) => {
      return res(context.status(200), context.json({ message: 'ok' }));
    });
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});

// // Clean up after the tests are finished.
afterAll(() => server.close());

test('should show organizations', async () => {
  const screen = render(<OrganizationList loggedInUserId={1} />);
  await waitForLoadingToFinish();
  expect(await screen.findByText(/15th mdg/i)).toBeInTheDocument();
});

test('should delete a organization', async () => {
  server.use(
    rest.delete(EUri.ORGANIZATIONS + '2', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          message: 'ok',
        })
      );
    })
  );
  const screen = render(<OrganizationList loggedInUserId={1} />);

  expect(await screen.findByText(/organization 2/i)).toBeInTheDocument();

  const row = screen.getByRole('row', {
    name: /organization 2/i,
  });

  fireEvent.click(row);

  expect(await screen.findByText(/organization selected/i)).toBeInTheDocument();

  server.use(
    rest.delete(EUri.ORGANIZATIONS + '2', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          message: 'ok',
        })
      );
    }),
    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          organizations: [{ id: '1', name: '15th Medical group', shortName: '15th mdg', parentId: null, types: [] }],
        })
      );
    })
  );

  const deleteButton = await screen.findByRole('button', {
    name: /delete/i,
  });

  fireEvent.click(deleteButton);

  await waitFor(() => screen.findByText(/organization deleted/i));
  await waitForElementToBeRemoved(() => screen.getByText(/organization 2/i));
});

test('should not be able to delete org with children or users', async () => {
  const screen = render(<OrganizationList loggedInUserId={1} />);

  expect(await screen.findByText(/15th mdg/i)).toBeInTheDocument();

  const row = screen.getByRole('row', {
    name: /15th mdg/i,
  });

  fireEvent.click(row);

  expect(await screen.findByText(/organization selected/i)).toBeInTheDocument();

  const deleteButton = await screen.findByRole('button', {
    name: /delete/i,
  });

  await userEvent.hover(deleteButton.parentElement as HTMLElement);

  expect(screen.getByText(/Unable to delete because org has/i)).toBeInTheDocument();

  await userEvent.unhover(deleteButton.parentElement as HTMLElement);

  expect(deleteButton).toBeDisabled();
});

test('should add new organization', async () => {
  server.use(
    rest.post(EUri.ORGANIZATIONS, (req, res, context) => {
      return res(context.status(200), context.json(req.body));
    })
  );

  const screen = render(<OrganizationList loggedInUserId={1} />);

  const addIcon = await screen.findByTestId('AddIcon');

  fireEvent.click(addIcon);

  const closeIcon = await screen.findByRole('button', {
    name: /dialog-close-button/i,
  });

  fireEvent.click(closeIcon);

  fireEvent.click(addIcon);

  screen.findByRole('button', {
    name: /dialog-close-button/i,
  });

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

  const orgSelect = await screen.findByRole('button', { name: /15th medical group/i });

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
  const screen = render(<OrganizationList loggedInUserId={1} />);

  expect(await screen.findByText(/organization 2/i)).toBeInTheDocument();

  const row = screen.getByRole('row', {
    name: /organization 2/i,
  });

  fireEvent.click(row);

  expect(await screen.findByText(/organization selected/i)).toBeInTheDocument();

  server.use(
    rest.put(EUri.ORGANIZATIONS + '2', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: '2',
          name: 'organization 3',
          shortName: 'org 3',
          parentId: null,
          types: [],
          children: [],
          users: [],
        })
      );
    })
  );

  const updateButton = await screen.findByRole('button', {
    name: /update/i,
  });

  expect(updateButton).toBeDisabled();

  const nameInput = screen.getByRole('textbox', { name: 'name' });

  fireEvent.change(nameInput, { target: { value: 'organization 3' } });

  const updateButtonAfterInput = await screen.findByRole('button', {
    name: /update/i,
  });

  expect(updateButtonAfterInput).not.toBeDisabled();

  fireEvent.click(updateButton);
  await waitFor(() => screen.findByRole('alert'));
});
