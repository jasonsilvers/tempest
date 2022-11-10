import { TrackingItemsList } from '../../../src/components/Devtools/TrackingItems';
import { ERole, EUri } from '../../../src/const/enums';
import { rest, server } from '../../testutils/mocks/msw';
import { fireEvent, render, waitFor, within } from '../../testutils/TempestTestUtils';

import 'whatwg-fetch';
import React from 'react';

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
            { id: 1, name: '15th Medical group', shortName: '15th mdg', parentId: null, types: ['CATALOG'] },
            { id: 2, name: 'organization 2', shortName: 'org 2', parentId: 1, types: [] },
            { id: 3, name: 'organization 3', shortName: 'org 3', parentId: 2, types: ['CATALOG'] },
            { id: 4, name: 'organization 4', shortName: 'org 4', parentId: 3, types: [] },
          ],
        })
      );
    }),
    rest.put(EUri.TRACKING_ITEMS + '*', (req, res, ctx) => {
      return res(ctx.status(200));
    }),
    rest.get(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          trackingItems: [
            {
              description: 'test description',
              id: 1,
              interval: 365,
              title: '15 MDG training',
              location: 'testLocation',
              organizationId: null,
              status: 'ACTIVE',
              _count: {
                memberTrackingItem: 0,
              },
            },
            {
              description: 'test description',
              id: 1,
              interval: 365,
              title: '15 MDG INACTIVE',
              location: 'testLocation',
              organizationId: null,
              status: 'INACTIVE',
              _count: {
                memberTrackingItem: 2,
              },
            },
            {
              description: 'test description 2',
              id: 1,
              interval: 365,
              title: 'New training',
              location: 'testLocation 2',
              organizationId: 3,
              status: 'ACTIVE',
              _count: {
                memberTrackingItem: 2,
              },
            },
            {
              description: 'test description 2',
              id: 1,
              interval: 365,
              title: 'Inactive Training',
              location: 'testLocation 2',
              organizationId: 3,
              status: 'INACTIVE',
            },
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

test('should render component with list of tracking items', async () => {
  const screen = render(<TrackingItemsList />);

  expect(await screen.findByText(/15 MDG training/i)).toBeInTheDocument();
  expect(await screen.findByText(/15 MDG INACTIVE/i)).toBeInTheDocument();
  expect(await screen.findByText(/New training/i)).toBeInTheDocument();
  expect(await screen.findByText(/Inactive Training/i)).toBeInTheDocument();
});

test('should allow admin to update organizationId', async () => {
  const screen = render(<TrackingItemsList />);

  expect(await screen.findByText(/15 MDG training/i)).toBeInTheDocument();

  const ti = screen.getByText(/15 mdg training/i).parentElement;

  const orgButton = within(ti).getByRole('button', { name: /none/i });

  fireEvent.mouseDown(orgButton);

  const org2Option = screen.getByRole('option', { name: /organization 2/i });

  fireEvent.click(org2Option);

  await waitFor(() => screen.getByRole('alert'));
});
