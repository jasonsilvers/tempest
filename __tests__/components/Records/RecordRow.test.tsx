/* eslint-disable @typescript-eslint/no-empty-function */
import { MemberTrackingRecord, TrackingItem, User } from '.prisma/client';
import dayjs from 'dayjs';
import React from 'react';
import 'whatwg-fetch';
import { MemberItemTrackerContextProvider } from '../../../src/components/Records/MemberRecordTracker/providers/MemberItemTrackerContext';
import * as MemberItemTrackerHooks from '../../../src/components/Records/MemberRecordTracker/providers/useMemberItemTrackerContext';
import RecordRow from '../../../src/components/Records/MemberRecordTracker/RecordRow';
import { ECategories, EUri } from '../../../src/const/enums';
import { rest, server } from '../../testutils/mocks/msw';
import { fireEvent, render, userEvent, waitFor } from '../../testutils/TempestTestUtils';

export function getToday(minus = 0) {
  const date = new Date();

  const monthShort = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate() - minus;
  const year = date.getFullYear();

  return `${monthShort} ${day}, ${year}`;
}

const trackingItemWithAnnualInterval: TrackingItem = {
  description: 'description',
  id: 1,
  interval: 365,
  title: 'Item Title',
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

// Establish API mocking before tests.
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
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
    activeCategory: ECategories.ALL,
    categories: [ECategories.ALL, ECategories.TODO],
    setActiveCategory: jest.fn(),
  }));

  const { getByText } = render(<RecordRow memberTrackingRecord={mtr1} trackingItem={trackingItemWithAnnualInterval} />);
  await waitFor(() => getByText(/item title/i));
  expect(getByText(/item title/i)).toBeInTheDocument();
});

test('should show N/A if interval is zero', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategories.SIGNATURE_REQUIRED,
    categories: [ECategories.ALL, ECategories.TODO, ECategories.SIGNATURE_REQUIRED],
    setActiveCategory: jest.fn(),
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
    activeCategory: ECategories.ALL,
    categories: [ECategories.ALL, ECategories.TODO, ECategories.SIGNATURE_REQUIRED],
    setActiveCategory: jest.fn(),
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

  const date = getToday();

  const datePicker = await screen.findByRole('button', { name: 'calendar-open-button' });
  userEvent.type(datePicker, date);
  const chosenDate = screen.getByRole('button', { name: date }); // choose any date that the calender shows
  fireEvent.click(chosenDate);

  const naDiv = screen.getByText(/n\/a/i);

  fireEvent.click(naDiv);

  await waitFor(() => screen.findByRole('alert'));
});

test('should alert user that signatures will be removed', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategories.ALL,
    categories: [ECategories.ALL, ECategories.TODO, ECategories.SIGNATURE_REQUIRED],
    setActiveCategory: jest.fn(),
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
  const chosenDate = screen.getByRole('button', { name: date }); // choose any date that the calender shows
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
    activeCategory: ECategories.ALL,
    categories: [ECategories.ALL, ECategories.TODO, ECategories.SIGNATURE_REQUIRED],
    setActiveCategory: jest.fn(),
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
  userEvent.type(datePicker, '');

  const intervalDiv = screen.getByText(/annual/i);

  fireEvent.click(intervalDiv);
});

test('should not fire mutation if completion date did not change', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategories.ALL,
    categories: [ECategories.ALL, ECategories.TODO, ECategories.SIGNATURE_REQUIRED],
    setActiveCategory: jest.fn(),
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
    activeCategory: ECategories.DONE,
    categories: [ECategories.TODO],
    setActiveCategory: jest.fn(),
  }));

  const { queryByText } = render(
    <RecordRow memberTrackingRecord={mtr1} trackingItem={trackingItemWithAnnualInterval} />
  );
  expect(queryByText(/item title/i)).toBeFalsy();
});

test('should not render if the status is not in the category list', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategories.DONE,
    categories: [ECategories.DONE],
    setActiveCategory: jest.fn(),
  }));

  const { queryByText } = render(
    <MemberItemTrackerContextProvider categories={[ECategories.ALL]}>
      <RecordRow memberTrackingRecord={mtr1} trackingItem={trackingItemWithAnnualInterval} />
    </MemberItemTrackerContextProvider>
  );

  expect(queryByText(/item title/i)).toBeFalsy();
});

test('should not render if the item status does not match active category', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategories.DONE,
    categories: [ECategories.ALL, ECategories.TODO, ECategories.DONE],
    setActiveCategory: jest.fn(),
  }));

  const { queryByText } = render(
    <RecordRow memberTrackingRecord={mtr1} trackingItem={trackingItemWithAnnualInterval} />
  );

  await waitFor(() => queryByText(/item title/i));
  expect(queryByText(/item title/i)).toBeFalsy();
});
