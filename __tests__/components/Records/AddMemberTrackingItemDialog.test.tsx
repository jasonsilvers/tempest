import {
  fireEvent,
  render,
  waitFor,
  waitForElementToBeRemoved,
  screen,
  findAllByRole,
  getByText,
} from '../../utils/TempestTestUtils';
import React from 'react';
import { rest } from 'msw';
import { AddMemberTrackingItemDialog } from '../../../src/components/Records/Dialog/AddMemberTrackingItemDialog';

import { server } from '../../utils/mocks/msw';

import 'whatwg-fetch';
import { EUri } from '../../../src/types/global';
import { TrackingItem } from '@prisma/client';

// Establish API mocking before tests.
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

const trackingItemsList = {
  trackingItems: [
    { id: 1, title: 'Fire Extinguisher', description: 'This is a AF yearly requirment', interval: 365 },
    { id: 2, title: 'Supervisor Safety Training', description: 'One time training for new supevisors', interval: 0 },
    { id: 3, title: 'Fire Safety', description: 'How to be SAFE when using Fire', interval: 60 },
    { id: 4, title: 'Big Bug Safety', description: 'There are big bugs in Hawaii!  Be careful!', interval: 365 },
  ],
};

const trackingItemsGet = (trackingItems) =>
  rest.get(EUri.TRACKING_ITEMS, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(trackingItems));
  });

test('should be able to add/delete items to list', async () => {
  server.use(trackingItemsGet(trackingItemsList));

  const { getByRole, findByRole, findAllByRole, getByText } = render(
    <AddMemberTrackingItemDialog handleClose={() => {}} forMemberId="342" />
  );

  await waitForElementToBeRemoved(() => getByRole('progressbar'));

  const trackingItemTrigger = getByRole('textbox');

  fireEvent.mouseDown(trackingItemTrigger);

  const options = await findAllByRole('option');

  fireEvent.click(options[1]);

  const selectedTrackingItem = getByText(/supervisor safety training/i);

  expect(selectedTrackingItem).toBeInTheDocument;

  const selectedTrackingItemDeletButton = getByRole('button', { name: 'tracking-item-delete-button' });

  fireEvent.click(selectedTrackingItemDeletButton);

  expect(selectedTrackingItem).not.toBeInTheDocument();
});
