import { fireEvent, render, waitForElementToBeRemoved, userEvent } from '../../../utils/TempestTestUtils';
import React, { useState } from 'react';
import { rest } from 'msw';
import { AddTrackingItemDialog } from '../../../../src/components/TrainingItems/Dialog/AddTrackingItemDialog';
import { server } from '../../../utils/mocks/msw';
import 'whatwg-fetch';
import { EUri } from '../../../../src/types/global';

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
  const { getByRole, getByText, queryByText } = render(<Container />);

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

  expect(getByText(newTrainingItemTitle)).toBeInTheDocument();
  expect(getByText(newTrainingItemDescription)).toBeInTheDocument();
  expect(getByText(2)).toBeInTheDocument();

  const deleteTrackingItemButton = getByRole('button', { name: 'delete-tracking-item-button' });
  fireEvent.click(deleteTrackingItemButton);

  expect(queryByText(newTrainingItemTitle)).not.toBeInTheDocument();
  expect(queryByText(newTrainingItemDescription)).not.toBeInTheDocument();
  expect(queryByText(2)).not.toBeInTheDocument();
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

  const addAllButton = getByRole('button', { name: /add all/i });

  fireEvent.click(addAllButton);

  await waitForElementToBeRemoved(() => getByText(/create new training/i));
});
