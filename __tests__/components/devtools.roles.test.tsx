import { Roles } from '../../src/components/Devtools/Roles';
import { ERole, EUri } from '../../src/const/enums';
import { rest, server } from '../testutils/mocks/msw';
import {
  fireEvent,
  render,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  waitForLoadingToFinish,
  within,
} from '../testutils/TempestTestUtils';

import 'whatwg-fetch';

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
    rest.get(EUri.ROLES, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          roles: [
            { id: 1, name: 'norole' },
            { id: 2, name: 'nonewRole' },
            { id: 3, name: 'randomrole' },
          ],
        })
      );
    })
  );
});

afterEach(() => {
  server.resetHandlers();
});
// Clean up after the tests are finished.
afterAll(() => server.close());

test('should render component with list of roles', async () => {
  const screen = render(<Roles />);
  expect(await screen.findByText(/norole/i)).toBeInTheDocument();
});

test('should add a role', async () => {
  server.use(
    rest.post(EUri.ROLES, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ name: 'anotherRole' }));
    })
  );

  const user = userEvent.setup();

  const screen = render(<Roles />);

  await waitForLoadingToFinish();
  const addNewRoleButton = screen.getByRole('button', {
    name: /add role/i,
  });

  fireEvent.click(addNewRoleButton);

  await user.keyboard('{Escape}');

  await waitForElementToBeRemoved(() => screen.getByRole('dialog'));

  fireEvent.click(addNewRoleButton);

  expect(
    screen.getByRole('heading', {
      name: /add new role/i,
    })
  ).toBeInTheDocument();

  const addRoleButton = screen.getByTestId('testIdButton');

  fireEvent.click(addRoleButton);

  await screen.findByText(/"name" contains an invalid value/i);

  const rolesSelectButton = screen.getByRole('button', {
    name: /please select a role/i,
  });

  fireEvent.mouseDown(rolesSelectButton);

  const options = screen.getAllByRole('option');

  fireEvent.click(options[1]);

  fireEvent.click(addRoleButton);

  await waitFor(() => screen.getByRole('alert'));
});

test('should delete a role', async () => {
  server.use(
    rest.delete(EUri.ROLES + '3', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ message: 'ok' }));
    })
  );
  const screen = render(<Roles />);

  await waitForLoadingToFinish();

  const row = await screen.findByRole('row', {
    name: /3 randomrole/i,
  });

  const deleteButton = within(row).getByRole('menuitem', {
    name: /delete/i,
  });

  expect(deleteButton).toBeInTheDocument();

  fireEvent.click(deleteButton);

  await waitFor(() => screen.getByRole('alert'));
});
