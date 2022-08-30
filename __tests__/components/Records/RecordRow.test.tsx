/* eslint-disable @typescript-eslint/no-empty-function */
import { MemberTrackingRecord, TrackingItem, User } from '.prisma/client';
import dayjs from 'dayjs';
import React from 'react';
import { QueryClient } from 'react-query';
import 'whatwg-fetch';
import { RecordRowActions } from '../../../src/components/Records/Actions/RecordRowActions';
import { MemberItemTrackerContextProvider } from '../../../src/components/Records/MemberRecordTracker/providers/MemberItemTrackerContext';
import * as MemberItemTrackerHooks from '../../../src/components/Records/MemberRecordTracker/providers/useMemberItemTrackerContext';
import RecordRow from '../../../src/components/Records/MemberRecordTracker/RecordRow';
import { ECategorie, EMtrVariant, EUri } from '../../../src/const/enums';
import { mtiQueryKeys } from '../../../src/hooks/api/memberTrackingItem';
import { andrewMonitor, joeAdmin, bobJones } from '../../testutils/mocks/fixtures';
import { rest, server } from '../../testutils/mocks/msw';
import {
  createWrapper,
  fireEvent,
  render,
  rtlRender,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  waitForLoadingToFinish,
} from '../../testutils/TempestTestUtils';

export function getToday(minus = 0) {
  const newDate = new Date();

  const monthShort = newDate.toLocaleString('default', { month: 'short' });
  const day = newDate.getDate() - minus;
  const year = newDate.getFullYear();

  return `${monthShort} ${day}, ${year}`;
}

const trackingItemWithAnnualInterval: TrackingItem = {
  description: 'description',
  id: 1,
  interval: 365,
  title: 'Item Title',
  location: 'this is the location',
  status: 'ACTIVE',
};

const mtr1 = {
  authorityId: null,
  id: 1,
  authoritySignedDate: null,
  completedDate: null,
  createdAt: null,
  order: 0,
  trackingItemId: 1,
  traineeId: 1,
  traineeSignedDate: null,
  trackingItem: trackingItemWithAnnualInterval,
} as MemberTrackingRecord & { trackingItem: TrackingItem; trainee: User; authority: User };

const mtr1WithCompleteDate = {
  authorityId: null,
  id: 1,
  authoritySignedDate: null,
  completedDate: new Date(),
  createdAt: null,
  order: 0,
  trackingItemId: 1,
  traineeId: 1,
  traineeSignedDate: null,
  trackingItem: trackingItemWithAnnualInterval,
} as MemberTrackingRecord & { trackingItem: TrackingItem; trainee: User; authority: User };

const memberTrackingItem = {
  createdAt: '2022-08-08T22:49:12.670Z',
  status: 'ACTIVE',
  trackingItem: trackingItemWithAnnualInterval,
  trackingItemId: 1,
  userId: 123,
};

// Establish API mocking before tests.
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });

  // add window.matchMedia
  // this is necessary for the date picker to be rendered in desktop mode.
  // if this is not provided, the mobile mode is rendered, which might lead to unexpected behavior
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      media: query,
      // this is the media query that @material-ui/pickers uses to determine if a device is a desktop device
      matches: query === '(pointer: fine)',
      onchange: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});
// // Clean up after the tests are finished.
afterAll(() => {
  server.close();
  delete window.matchMedia;
});

test('should render default case', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.ALL,
    categories: [ECategorie.ALL, ECategorie.TODO],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));

  const { getByText } = render(<RecordRow memberTrackingRecord={mtr1} trackingItem={trackingItemWithAnnualInterval} />);
  await waitFor(() => getByText(/item title/i));
  expect(getByText(/item title/i)).toBeInTheDocument();
});

test('should show N/A if interval is zero', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.SIGNATURE_REQUIRED,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.SIGNATURE_REQUIRED],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));

  const screen = render(
    <RecordRow
      memberTrackingRecord={{
        ...mtr1,
        completedDate: dayjs('04-19-2022').toDate(),
      }}
      trackingItem={{ ...trackingItemWithAnnualInterval, interval: 0 }}
    />
  );

  expect(screen.getByText(/n\/a/i)).toBeInTheDocument();
});

test('should change completion date', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.ALL,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.SIGNATURE_REQUIRED],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));

  server.use(
    rest.post(EUri.MEMBER_TRACKING_RECORDS + '1/update_completion', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          ...mtr1,
          completedDate: req.body.completedDate,
        })
      );
    })
  );

  const screen = render(
    <RecordRow
      memberTrackingRecord={{
        ...mtr1,
      }}
      trackingItem={{ ...trackingItemWithAnnualInterval, interval: 0 }}
    />
  );

  const todayDate = getToday();

  const datePicker = await screen.findByRole('button', { name: 'calendar-open-button' });
  userEvent.type(datePicker, todayDate);
  const chosenDate = await screen.findByRole('button', { name: todayDate }); // choose any date that the calender shows
  fireEvent.click(chosenDate);

  const naDiv = screen.getByText(/n\/a/i);

  fireEvent.click(naDiv);

  await waitFor(() => screen.findByRole('alert'));
});

test('should alert user that signatures will be removed', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.ALL,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.SIGNATURE_REQUIRED],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));

  server.use(
    rest.post(EUri.MEMBER_TRACKING_RECORDS + '1/update_completion', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          ...mtr1,
          completedDate: req.body.completedDate,
        })
      );
    })
  );

  const screen = render(
    <RecordRow
      memberTrackingRecord={{
        ...mtr1,
        traineeSignedDate: new Date().toISOString(),
      }}
      trackingItem={{ ...trackingItemWithAnnualInterval, interval: 0 }}
    />
  );

  const date = getToday();

  const datePicker = await screen.findByRole('button', { name: 'calendar-open-button' });
  userEvent.type(datePicker, date);
  const chosenDate = await screen.findByRole('button', { name: date }); // choose any date that the calender shows
  fireEvent.click(chosenDate);

  const naDiv = screen.getByText(/n\/a/i);

  fireEvent.click(naDiv);

  await waitFor(() => screen.getByText(/changing the completion date will clear all signatures present/i));
  const yesButton = screen.getByRole('button', {
    name: /yes/i,
  });

  fireEvent.click(yesButton);
  await waitFor(() => screen.findByRole('alert'));
});

test('should not fire mutation if completion date did not change and was empty', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.ALL,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.SIGNATURE_REQUIRED],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));

  const screen = render(
    <RecordRow
      memberTrackingRecord={{
        ...mtr1,
      }}
      trackingItem={{ ...trackingItemWithAnnualInterval, interval: 365 }}
    />
  );

  const datePicker = await screen.findByRole('button', { name: 'calendar-open-button' });
  fireEvent.click(datePicker);

  const intervalDiv = screen.getByText(/annual/i);

  fireEvent.click(intervalDiv);
});

test('should not fire mutation if completion date did not change', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.ALL,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.SIGNATURE_REQUIRED],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));

  const date = getToday();

  const screen = render(
    <RecordRow
      memberTrackingRecord={{
        ...mtr1,
        completedDate: new Date(date).toISOString(),
      }}
      trackingItem={{ ...trackingItemWithAnnualInterval, interval: 365 }}
    />
  );

  const datePicker = await screen.findByRole('button', { name: 'calendar-open-button' });
  fireEvent.click(datePicker);
  userEvent.type(datePicker, date);

  const intervalDiv = screen.getByText(/annual/i);

  fireEvent.click(intervalDiv);
});

test('should not render if the category list does not include the active category', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.DONE,
    categories: [ECategorie.TODO],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));

  const { queryByText } = render(
    <RecordRow memberTrackingRecord={mtr1} trackingItem={trackingItemWithAnnualInterval} />
  );
  expect(queryByText(/item title/i)).toBeFalsy();
});

test('should not render if the status is not in the category list', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.DONE,
    categories: [ECategorie.DONE],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));

  const { queryByText } = render(
    <MemberItemTrackerContextProvider categories={[ECategorie.ALL]} variant={EMtrVariant.IN_PROGRESS}>
      <RecordRow memberTrackingRecord={mtr1} trackingItem={trackingItemWithAnnualInterval} />
    </MemberItemTrackerContextProvider>
  );

  expect(queryByText(/item title/i)).toBeFalsy();
});

test('should not render if the item status does not match active category', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.DONE,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.DONE],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));

  const { queryByText } = render(
    <RecordRow memberTrackingRecord={mtr1} trackingItem={trackingItemWithAnnualInterval} />
  );

  await waitFor(() => queryByText(/item title/i));
  expect(queryByText(/item title/i)).toBeFalsy();
});

test('should not show delete button on completed record if monitor or member', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.ALL,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.DONE],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));
  const date = new Date();
  const screen = render(
    <RecordRowActions
      authoritySignedDate={date}
      traineeSignedDate={date}
      memberTrackingRecord={{ ...mtr1, traineeSignedDate: date, authoritySignedDate: date }}
      disabled={false}
    />
  );

  await waitForLoadingToFinish();

  expect(screen.queryByTestId('DeleteIcon')).not.toBeInTheDocument();
});

test('should show delete button on completed record if admin', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.DONE,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.DONE],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(joeAdmin));
    }),

    rest.delete(EUri.MEMBER_TRACKING_RECORDS + 1, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ message: 'ok' }));
    })
  );

  const date = new Date();
  const screen = render(
    <RecordRowActions
      authoritySignedDate={date}
      traineeSignedDate={date}
      memberTrackingRecord={{ ...mtr1, traineeSignedDate: date, authoritySignedDate: date }}
      disabled={false}
    />
  );

  await waitForLoadingToFinish();

  expect(screen.queryByTestId('DeleteIcon')).toBeInTheDocument();

  const deleteButton = screen.getByTestId('DeleteIcon');

  fireEvent.click(deleteButton);

  await waitFor(() => screen.findByRole('alert'));
});

test('should show awaiting signature when disabled', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.DONE,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.DONE],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(andrewMonitor));
    })
  );

  const date = new Date();
  const screen = render(
    <RecordRowActions
      authoritySignedDate={date}
      traineeSignedDate={date}
      memberTrackingRecord={{ ...mtr1, traineeSignedDate: date, authoritySignedDate: date }}
      disabled={true}
    />
  );

  const awaitingSignDisabledButtons = await screen.findAllByText(/awaiting signature/i);

  expect(awaitingSignDisabledButtons.length).toEqual(2);
});

test('should show awaiting signature for member', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.DONE,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.DONE],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(andrewMonitor));
    })
  );

  const screen = render(
    <RecordRowActions
      authoritySignedDate={null}
      traineeSignedDate={null}
      memberTrackingRecord={{
        ...mtr1WithCompleteDate,
        authorityId: andrewMonitor?.id,
        traineeSignedDate: null,
        authoritySignedDate: null,
      }}
      disabled={false}
    />
  );

  await waitForLoadingToFinish();
  expect(await screen.findByText(/awaiting signature/i)).toBeInTheDocument();
});

test('should show awaiting signature for monitor', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.DONE,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.DONE],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(bobJones));
    })
  );

  const screen = render(
    <RecordRowActions
      authoritySignedDate={null}
      traineeSignedDate={null}
      memberTrackingRecord={{
        ...mtr1WithCompleteDate,
        traineeId: bobJones.id,
        traineeSignedDate: null,
        authoritySignedDate: null,
      }}
      disabled={false}
    />
  );

  await waitForLoadingToFinish();
  expect(await screen.findByText(/awaiting signature/i)).toBeInTheDocument();
});

test('should show awaiting signature for monitor', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.DONE,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.DONE],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(bobJones));
    })
  );

  const screen = render(
    <RecordRowActions
      authoritySignedDate={null}
      traineeSignedDate={null}
      memberTrackingRecord={{
        ...mtr1WithCompleteDate,
        traineeId: bobJones.id,
        traineeSignedDate: null,
        authoritySignedDate: null,
      }}
      disabled={false}
    />
  );

  await waitForLoadingToFinish();
  expect(await screen.findByText(/awaiting signature/i)).toBeInTheDocument();
});

test('should be able to delete incomplete record', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.DONE,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.DONE],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(bobJones));
    }),
    rest.delete(EUri.MEMBER_TRACKING_RECORDS + 1, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ message: 'ok' }));
    })
  );

  const screen = render(
    <RecordRowActions
      authoritySignedDate={null}
      traineeSignedDate={null}
      memberTrackingRecord={{
        ...mtr1WithCompleteDate,
        traineeId: bobJones.id,
        traineeSignedDate: null,
        authoritySignedDate: null,
      }}
      disabled={false}
    />
  );

  await waitForLoadingToFinish();

  expect(screen.queryByTestId('DeleteIcon')).toBeInTheDocument();

  const deleteButton = screen.getByTestId('DeleteIcon');

  fireEvent.click(deleteButton);

  await waitFor(() => screen.findByRole('alert'));
});

test('should show signedOn for monitor', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.DONE,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.DONE],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.IN_PROGRESS,
  }));
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(bobJones));
    })
  );

  const date = getToday();

  const screen = render(
    <RecordRowActions
      authoritySignedDate={date}
      traineeSignedDate={null}
      memberTrackingRecord={{
        ...mtr1WithCompleteDate,
        traineeId: bobJones.id,
        traineeSignedDate: null,
        authoritySignedDate: date,
        authority: andrewMonitor,
      }}
      disabled={false}
    />
  );

  await waitForLoadingToFinish();

  expect(await screen.findByText(/signed on/i)).toBeInTheDocument();
});

test('Archive actions - on archive screen - should disable UNARCHIVE if tracking item is INACTIVE', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.ALL,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.DONE],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.ARCHIVED,
  }));
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(andrewMonitor));
    })
  );

  const date = new Date();

  const queryClient = new QueryClient();

  queryClient.setQueryData(mtiQueryKeys.memberTrackingItems(memberTrackingItem.userId, EMtrVariant.ARCHIVED), [
    { ...memberTrackingItem, trackingItem: { ...memberTrackingItem.trackingItem, status: 'INACTIVE' } },
  ]);

  const Wrapper = createWrapper(queryClient);

  const screen = rtlRender(
    <RecordRowActions
      authoritySignedDate={date}
      traineeSignedDate={date}
      memberTrackingRecord={{
        ...mtr1WithCompleteDate,
        traineeId: bobJones.id,
        traineeSignedDate: date,
        authoritySignedDate: date,
        authority: andrewMonitor,
      }}
      disabled={false}
    />,
    {
      wrapper: function withWrapper(props) {
        return <Wrapper {...props} />;
      },
    }
  );

  await waitForLoadingToFinish();
  expect(await screen.findByTestId('LockIcon')).toBeInTheDocument();

  const unarchiveText = screen.getByText(/unarchive/i);

  fireEvent.mouseEnter(unarchiveText);

  expect(await screen.findByText(/this item is no longer a requirement/i)).toBeInTheDocument();

  fireEvent.mouseLeave(unarchiveText);

  await waitForElementToBeRemoved(() => screen.getByText(/this item is no longer a requirement/i));
});

test('Archive actions - on completed screen', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.ALL,
    categories: [ECategorie.ALL, ECategorie.TODO, ECategorie.DONE],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.COMPLETED,
  }));
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(andrewMonitor));
    }),

    rest.put('*', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          ...mtr1,
          status: 'INACTIVE',
        })
      );
    })
  );

  const date = new Date();

  const screen = render(
    <RecordRowActions
      authoritySignedDate={date}
      traineeSignedDate={date}
      memberTrackingRecord={{
        ...mtr1WithCompleteDate,
        traineeId: bobJones.id,
        traineeSignedDate: date,
        authoritySignedDate: date,
        authority: andrewMonitor,
      }}
      disabled={false}
    />
  );

  await waitForLoadingToFinish();

  expect(
    await screen.findByRole('button', {
      name: /archive-tracking-record/i,
    })
  ).toBeInTheDocument();

  const archiveButton = await screen.findByRole('button', {
    name: /archive-tracking-record/i,
  });

  fireEvent.click(archiveButton);

  await waitFor(() => screen.findByRole('alert'));
});

test('Archive actions - on archive screen', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategorie.ARCHIVED,
    categories: [ECategorie.ALL],
    setActiveCategory: jest.fn(),
    variant: EMtrVariant.ARCHIVED,
  }));
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(andrewMonitor));
    }),

    rest.put('*', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          ...mtr1,
          status: 'ACTIVE',
        })
      );
    })
  );

  const date = new Date();

  const queryClient = new QueryClient();

  queryClient.setQueryData(mtiQueryKeys.memberTrackingItems(memberTrackingItem.userId, EMtrVariant.ARCHIVED), [
    memberTrackingItem,
  ]);

  const Wrapper = createWrapper(queryClient);

  const screen = rtlRender(
    <RecordRowActions
      authoritySignedDate={date}
      traineeSignedDate={date}
      memberTrackingRecord={{
        ...mtr1WithCompleteDate,
        traineeId: bobJones.id,
        traineeSignedDate: date,
        authoritySignedDate: date,
        authority: andrewMonitor,
      }}
      disabled={false}
    />,
    {
      wrapper: function withWrapper(props) {
        return <Wrapper {...props} />;
      },
    }
  );

  await waitForLoadingToFinish();

  expect(screen.getByText(/unarchive/i)).toBeInTheDocument();

  const unarchiveButton = screen.getByRole('button', {
    name: /unarchive/i,
  });

  fireEvent.click(unarchiveButton);

  await waitFor(() => screen.findByRole('alert'));
});
