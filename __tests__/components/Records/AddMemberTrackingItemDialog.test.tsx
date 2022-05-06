import {
  fireEvent,
  render,
  waitFor,
  waitForElementToBeRemoved,
  createWrapper,
  rtlRender,
} from '../../testutils/TempestTestUtils';
import React, { useState } from 'react';
import { rest } from 'msw';
import { AddMemberTrackingItemDialog } from '../../../src/components/Records/Dialog/AddMemberTrackingItemDialog';
import { server } from '../../testutils/mocks/msw';
import 'whatwg-fetch';
import { EUri } from '../../../src/const/enums';
import { TrackingItem, User } from '@prisma/client';
import dayjs from 'dayjs';
import { MemberTrackingItemWithAll } from '../../../src/repositories/memberTrackingRepo';
import { UserWithAll } from '../../../src/repositories/userRepo';
import { QueryClient } from 'react-query';
import { mtiQueryKeys } from '../../../src/hooks/api/memberTrackingItem';

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
  const [openAddNewModal, setAddNewModal] = useState(false);

  return (
    <div>
      <button
        onClick={() => {
          setAddNewModal(true);
        }}
      >
        Open Dialog
      </button>
      {openAddNewModal ? (
        <AddMemberTrackingItemDialog
          forMemberId={423}
          handleClose={() => setAddNewModal(false)}
        ></AddMemberTrackingItemDialog>
      ) : null}
    </div>
  );
};

const trackingItemsList = {
  trackingItems: [
    { id: 1, title: 'Fire Extinguisher', description: 'This is a AF yearly requirment', interval: 365 },
    { id: 2, title: 'Supervisor Safety Training', description: 'One time training for new supevisors', interval: 0 },
    { id: 3, title: 'Fire Safety', description: 'How to be SAFE when using Fire', interval: 60 },
    { id: 4, title: 'Big Bug Safety', description: 'There are big bugs in Hawaii!  Be careful!', interval: 365 },
  ],
};

const testTrainee: Partial<UserWithAll> = {
  id: 123,
  firstName: 'bob',
  lastName: 'jones',
  rank: 'SSgt/E-5',
  memberTrackingItems: null,
};

const fireSafetyItem: TrackingItem = {
  id: 3,
  title: 'Fire Safety',
  interval: 365,
  description: 'how to be safe with fire',
};

const memberTrackingItems: MemberTrackingItemWithAll[] = [
  {
    isActive: true,
    trackingItemId: 1,
    userId: 123,
    trackingItem: fireSafetyItem,
    user: testTrainee as User,
    createdAt: dayjs().toDate(),
    memberTrackingRecords: [
      {
        id: 1,
        order: 0,
        trackingItemId: 3,
        trackingItem: fireSafetyItem,
        traineeId: 423,
        authorityId: 321,
        createdAt: dayjs().toDate(),
        authoritySignedDate: dayjs().toDate(),
        completedDate: dayjs().toDate(),
        traineeSignedDate: null,
        trainee: testTrainee as User,
        authority: null,
      },
    ],
  },
];

// use member tracking record
const memberTrackingItemsGet = (user) =>
  rest.get(EUri.USERS + '*/membertrackingitems', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(user));
  });

const trackingItemsGet = (trackingItems) =>
  rest.get(EUri.TRACKING_ITEMS, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(trackingItems));
  });

const trackingRecordPost = () =>
  rest.post(EUri.MEMBER_TRACKING_RECORDS, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        completedDate: null,
        traineeId: '3ee28a67-24b3-4f88-b272-012ad821f293',
        trackingItemId: 2,
      })
    );
  });

const trackingItemAndRecordPost = () =>
  rest.post(EUri.MEMBER_TRACKING_ITEMS, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        isActive: true,
        userId: '3ee28a67-24b3-4f88-b272-012ad821f293',
        trackingItemId: 2,
        memberTrackingRecords: [
          {
            id: 6,
            traineeSignedDate: null,
            authoritySignedDate: null,
            authorityId: null,
            completedDate: null,
            order: 1,
            traineeId: '3ee28a67-24b3-4f88-b272-012ad821f293',
            trackingItemId: 2,
            trackingItem: {
              id: 2,
              title: 'Supervisor Safety Training',
              description: 'One time training for new supevisors',
              interval: 0,
            },
          },
        ],
      })
    );
  });

test('should be able to add/delete items to list', async () => {
  server.use(trackingItemsGet(trackingItemsList));

  const { getByRole, findAllByRole, getByText } = render(
    <AddMemberTrackingItemDialog handleClose={() => {}} forMemberId={testTrainee.id} /> // eslint-disable-line
  );

  await waitForElementToBeRemoved(() => getByRole('progressbar'));

  const trackingItemTrigger = getByRole('combobox');

  fireEvent.mouseDown(trackingItemTrigger);

  const options = await findAllByRole('option');

  fireEvent.click(options[1]);

  const selectedTrackingItem = getByText(/supervisor safety training/i);

  expect(selectedTrackingItem).toBeInTheDocument;

  const selectedTrackingItemDeletButton = getByRole('button', { name: 'tracking-item-delete-button' });

  fireEvent.click(selectedTrackingItemDeletButton);

  expect(selectedTrackingItem).not.toBeInTheDocument();
});

test('should not allow duplicate memberTrackingRecords in progress', async () => {
  server.use(trackingItemsGet(trackingItemsList), memberTrackingItemsGet({ ...testTrainee, memberTrackingItems }));

  const queryClient = new QueryClient();

  const singleMemberTrackingRecord = memberTrackingItems[0].memberTrackingRecords[0];

  queryClient.setQueryData(mtiQueryKeys.memberTrackingItems(singleMemberTrackingRecord.traineeId), memberTrackingItems);

  const Wrapper = createWrapper(queryClient);

  const { getByRole, findAllByRole, getByText, queryByText } = rtlRender(<Container />, {
    wrapper: function withWrapper(props) {
      return <Wrapper {...props} />;
    },
  });

  const openDialogTrigger = getByText(/open dialog/i);
  fireEvent.click(openDialogTrigger);

  await waitForElementToBeRemoved(() => getByRole('progressbar'));
  const trackingItemTrigger = getByRole('combobox');

  fireEvent.mouseDown(trackingItemTrigger);

  const options = await findAllByRole('option');
  expect(options.length).toBe(3);

  expect(queryByText(/fire safety/i)).not.toBeInTheDocument();
});

test('should create membertrackingrecord if already have membertracking item', async () => {
  server.use(
    trackingItemsGet(trackingItemsList),
    trackingRecordPost(),
    memberTrackingItemsGet({ ...testTrainee, memberTrackingItems })
  );

  const { getByRole, findAllByRole, getByText, queryByText } = render(<Container />);

  const openDialogTrigger = getByText(/open dialog/i);
  fireEvent.click(openDialogTrigger);

  await waitForElementToBeRemoved(() => getByRole('progressbar'));

  const trackingItemTrigger = getByRole('combobox');

  fireEvent.mouseDown(trackingItemTrigger);

  const options = await findAllByRole('option');

  fireEvent.click(options[0]);

  const addButton = getByRole('button', { name: 'Add' });

  fireEvent.click(addButton);

  await waitForElementToBeRemoved(() => getByRole('progressbar')).catch((error) => console.log(error));

  await waitFor(() => queryByText(/a record was successfully added/i));
});

test('should add membertrackingitem and membertrackingrecord', async () => {
  server.use(
    trackingItemsGet(trackingItemsList),
    trackingItemAndRecordPost(),
    memberTrackingItemsGet({ ...testTrainee, memberTrackingItems })
  );

  const { getByRole, findAllByRole, getByText, queryByText } = render(<Container />);

  const openDialogTrigger = getByText(/open dialog/i);
  fireEvent.click(openDialogTrigger);

  await waitForElementToBeRemoved(() => getByRole('progressbar'));

  const trackingItemTrigger = getByRole('combobox');

  fireEvent.mouseDown(trackingItemTrigger);

  const options = await findAllByRole('option');

  fireEvent.click(options[2]);

  const addButton = getByRole('button', { name: 'Add' });

  fireEvent.click(addButton);
  await waitForElementToBeRemoved(() => getByRole('progressbar')).catch((error) => console.log(error));

  await waitFor(() => queryByText(/a record was successfully added/i));
});
