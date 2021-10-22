import { fireEvent, render, waitForElementToBeRemoved, userEvent } from '../../../testutils/TempestTestUtils';
import React, { useState } from 'react';
import { AddTrackingItemDialog } from '../../../../src/components/TrainingItems/Dialog/AddTrackingItemDialog';
import { server, rest } from '../../../testutils/mocks/msw';
import 'whatwg-fetch';
import { EUri } from '../../../../src/const/enums';

const trackingItemsList = {
  trackingItems: [
    { id: 1, title: 'Fire Extinguisher', description: 'This is a AF yearly requirment', interval: 365 },
    { id: 2, title: 'Supervisor Safety Training', description: 'One time training for new supevisors', interval: 0 },
    { id: 3, title: 'Fire Safety', description: 'How to be SAFE when using Fire', interval: 60 },
    { id: 4, title: 'Big Bug Safety', description: 'There are big bugs in Hawaii!  Be careful!', interval: 365 },
  ],
};

// Establish API mocking before tests.
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
});
beforeEach(() => {
  server.use(
    rest.get(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(trackingItemsList));
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

const Container = () => {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div>
      <h1>Click</h1>
      <button
        onClick={() => {
          setOpenDialog(true);
        }}
      >
        Open Dialog
      </button>
      <AddTrackingItemDialog isOpen={openDialog} handleClose={() => setOpenDialog(false)}></AddTrackingItemDialog>
    </div>
  );
};

test('should open and close dialog', async () => {
  const { getByRole, getByText, queryByText } = render(<Container />);

  const openDialogButton = getByRole('button', { name: /open dialog/i });
  fireEvent.click(openDialogButton);

  const addButton = getByRole('button', { name: /create/i });
  expect(addButton).toBeDisabled();

  const closeButton = getByRole('button', { name: /close/i });
  fireEvent.click(closeButton);

  await waitForElementToBeRemoved(() => getByText(/create new training/i));

  expect(queryByText(/create new training/i)).not.toBeInTheDocument();
});

test('should add new training to list waiting to be added', async () => {
  server.use(
    rest.post(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ title: 'New training item title', description: 'New training item description', interval: 2 })
      );
    })
  );

  const { getByRole, getByText } = render(<Container />);

  const openDialogButton = getByRole('button', { name: /open dialog/i });
  fireEvent.click(openDialogButton);

  const trainingTitleInput = getByRole('textbox', { name: 'training-title-input' });
  const trainingDescriptionInput = getByRole('textbox', { name: 'training-description-input' });
  const trainingIntervalInput = getByRole('spinbutton', { name: 'training-interval-input' });

  const newTrainingItemTitle = 'New training item title';
  const newTrainingItemDescription = 'New training item description';

  fireEvent.change(trainingTitleInput, { target: { value: newTrainingItemTitle } });
  fireEvent.change(trainingDescriptionInput, { target: { value: newTrainingItemDescription } });
  userEvent.type(trainingIntervalInput, '2');

  const createButton = getByRole('button', { name: /create/i });
  fireEvent.click(createButton);

  await waitForElementToBeRemoved(() => getByText(/create new training/i));
});
