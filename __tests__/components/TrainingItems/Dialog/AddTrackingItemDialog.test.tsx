import { fireEvent, render, waitForElementToBeRemoved, userEvent } from '../../../testutils/TempestTestUtils';
import React, { useState } from 'react';
import { AddTrackingItemDialog } from '../../../../src/components/TrainingItems/Dialog/AddTrackingItemDialog';
import { server, rest } from '../../../testutils/mocks/msw';
import 'whatwg-fetch';
import { EUri } from '../../../../src/const/enums';

const trackingItemsList = {
  trackingItems: [
    { id: 1, title: 'Fire Extinguisher', description: 'This is a AF yearly requirment', interval: 365, location: '' },
    {
      id: 2,
      title: 'Supervisor Safety Training',
      description: 'One time training for new supevisors',
      interval: 0,
      location: '',
    },
    { id: 3, title: 'Fire Safety', description: 'How to be SAFE when using Fire', interval: 60, location: '' },
    {
      id: 4,
      title: 'Big Bug Safety',
      description: 'There are big bugs in Hawaii!  Be careful!',
      interval: 365,
      location: '',
    },
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

  const closeButton = getByRole('button', { name: /dialog-close-button/i });
  fireEvent.click(closeButton);

  await waitForElementToBeRemoved(() => getByText(/create new training/i));

  expect(queryByText(/create new training/i)).not.toBeInTheDocument();
});

test('should add new training to list waiting to be added', async () => {
  server.use(
    rest.post(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          title: 'New training item title',
          description: 'New training item description',
          interval: 2,
          location: 'New training item location',
        })
      );
    })
  );

  const { getByRole, getByText, getAllByRole } = render(<Container />);

  const openDialogButton = getByRole('button', { name: /open dialog/i });
  fireEvent.click(openDialogButton);

  const trainingTitleInput = getByRole('textbox', { name: 'training-title-input' });
  const trainingDescriptionInput = getByRole('textbox', { name: 'training-description-input' });
  const trainingLocationInput = getByRole('textbox', {
    name: 'training-location-input',
  });
  const trainingIntervalSelect = getByRole('button', {
    name: /recurrance-select/i,
  });

  const newTrainingItemTitle = 'New training item title';
  const newTrainingItemDescription = 'New training item description';
  const newTrainingItemLocation = 'New training item location';

  fireEvent.change(trainingTitleInput, { target: { value: newTrainingItemTitle } });
  fireEvent.mouseDown(trainingIntervalSelect);
  const options = getAllByRole('option');
  fireEvent.click(options[1]);
  fireEvent.change(trainingLocationInput, { target: { value: newTrainingItemLocation } });
  fireEvent.change(trainingDescriptionInput, { target: { value: newTrainingItemDescription } });

  const createButton = getByRole('button', { name: /create/i });
  fireEvent.click(createButton);

  await waitForElementToBeRemoved(() => getByText(/create new training/i));
});

test('should add training with zero interval', async () => {
  server.use(
    rest.post(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          title: 'New training item title',
          description: 'New training item description',
          interval: 2,
          location: 'New training itetm location',
        })
      );
    })
  );

  const { getByRole, getByText, getAllByRole } = render(<Container />);

  const openDialogButton = getByRole('button', { name: /open dialog/i });
  fireEvent.click(openDialogButton);

  const trainingTitleInput = getByRole('textbox', { name: 'training-title-input' });
  const trainingDescriptionInput = getByRole('textbox', { name: 'training-description-input' });
  const trainingLocationInput = getByRole('textbox', {
    name: /training-location-input/i,
  });
  const trainingIntervalSelect = getByRole('button', {
    name: /recurrance-select/i,
  });

  const newTrainingItemTitle = 'New training item title';
  const newTrainingItemDescription = 'New training item description';
  const newTrainingItemLocation = 'New training itetm location';

  fireEvent.change(trainingTitleInput, { target: { value: newTrainingItemTitle } });
  fireEvent.change(trainingDescriptionInput, { target: { value: newTrainingItemDescription } });
  fireEvent.change(trainingLocationInput, { target: { value: newTrainingItemLocation } });
  fireEvent.mouseDown(trainingIntervalSelect);
  const options = getAllByRole('option');
  fireEvent.click(options[5]);

  const createButton = getByRole('button', { name: /create/i });
  fireEvent.click(createButton);

  await waitForElementToBeRemoved(() => getByText(/create new training/i));
});

test('should show duplicates', async () => {
  server.use(
    rest.post(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ title: 'New training item title', description: 'New training item description', interval: 2 })
      );
    })
  );

  const { getByRole, queryByText } = render(<Container />);

  const openDialogButton = getByRole('button', { name: /open dialog/i });
  fireEvent.click(openDialogButton);

  await waitForElementToBeRemoved(() => getByRole('progressbar'));
  const trainingTitleInput = getByRole('textbox', { name: 'training-title-input' });
  const trainingDescriptionInput = getByRole('textbox', { name: 'training-description-input' });

  const newTrainingItemTitle = 'Big';
  const newTrainingItemDescription = 'New training item description';

  userEvent.type(trainingTitleInput, newTrainingItemTitle);
  fireEvent.change(trainingDescriptionInput, { target: { value: newTrainingItemDescription } });

  expect(queryByText(/Bug Safety/i)).toBeInTheDocument();

  const createButton = getByRole('button', { name: /create/i });
  fireEvent.click(createButton);

  expect(queryByText(/this is a potential duplicate/i)).toBeInTheDocument();

  fireEvent.click(getByRole('button', { name: 'No' }));
});

test('should tell user they cannot add a duplicate', async () => {
  server.use(
    rest.post(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ title: 'New training item title', description: 'New training item description', interval: 2 })
      );
    })
  );

  const { getByRole, queryByText } = render(<Container />);

  const openDialogButton = getByRole('button', { name: /open dialog/i });
  fireEvent.click(openDialogButton);

  await waitForElementToBeRemoved(() => getByRole('progressbar'));
  const trainingTitleInput = getByRole('textbox', { name: 'training-title-input' });
  const trainingDescriptionInput = getByRole('textbox', { name: 'training-description-input' });

  const newTrainingItemTitle = 'Big Bug Safety';
  const newTrainingItemDescription = 'New training item description';

  userEvent.type(trainingTitleInput, newTrainingItemTitle);
  fireEvent.change(trainingDescriptionInput, { target: { value: newTrainingItemDescription } });

  expect(queryByText(/unable to add/i)).toBeInTheDocument();
});

test('should tell user they cannot add a duplicate', async () => {
  server.use(
    rest.post(EUri.TRACKING_ITEMS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ title: 'New training item title', description: 'New training item description', interval: 2 })
      );
    })
  );

  const { getByRole, queryByText, getByText } = render(<Container />);

  const openDialogButton = getByRole('button', { name: /open dialog/i });
  fireEvent.click(openDialogButton);

  await waitForElementToBeRemoved(() => getByRole('progressbar'));
  const trainingTitleInput = getByRole('textbox', { name: 'training-title-input' });
  const trainingDescriptionInput = getByRole('textbox', { name: 'training-description-input' });

  const newTrainingItemTitle = 'Big Bug';
  const newTrainingItemDescription = 'New training item description';

  userEvent.type(trainingTitleInput, newTrainingItemTitle);
  fireEvent.change(trainingDescriptionInput, { target: { value: newTrainingItemDescription } });

  const createButton = getByRole('button', { name: /create/i });
  fireEvent.click(createButton);

  expect(queryByText(/this is a potential duplicate/i)).toBeInTheDocument();

  fireEvent.click(getByRole('button', { name: 'Yes' }));

  await waitForElementToBeRemoved(() => getByText(/create new training/i));
});
