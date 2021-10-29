import { TrackingItem } from '.prisma/client';
import React from 'react';
import { MemberItemTrackerContextProvider } from '../../../src/components/Records/MemberRecordTracker/providers/MemberItemTrackerContext';
import RecordRow, { RecordWithTrackingItem } from '../../../src/components/Records/MemberRecordTracker/RecordRow';
import { ECategories, EUri } from '../../../src/const/enums';
import { render, waitFor, waitForElementToBeRemoved } from '../../testutils/TempestTestUtils';
import * as MemberItemTrackerHooks from '../../../src/components/Records/MemberRecordTracker/providers/useMemberItemTrackerContext';
import 'whatwg-fetch';
import { server, rest } from '../../testutils/mocks/msw';
import dayjs from 'dayjs';

const trackingItemWithAnnualInterval: TrackingItem = {
  description: 'description',
  id: 1,
  interval: 365,
  title: 'Item Title',
};

const trackingItemWithFourDayInterval: TrackingItem = {
  description: 'description',
  id: 1,
  interval: 4,
  title: 'Item Title',
};

// Establish API mocking before tests.
beforeEach(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });

  server.use(
    // return member tracking record with status of 'todo'
    rest.get(EUri.MEMBER_TRACKING_RECORDS + '1', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          authorityId: null,
          id: 1,
          authoritySignedDate: null,
          completedDate: null,
          order: 0,
          trackingItemId: 1,
          traineeId: '1',
          traineeSignedDate: null,
          trackingItem: trackingItemWithAnnualInterval,
        } as RecordWithTrackingItem)
      );
    }),
    rest.get(EUri.MEMBER_TRACKING_RECORDS + 2, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          authorityId: null,
          id: 2,
          authoritySignedDate: dayjs('2021-01-02').toDate(),
          completedDate: null,
          order: 0,
          trackingItemId: 1,
          traineeId: '1',
          traineeSignedDate: null,
          trackingItem: trackingItemWithAnnualInterval,
        } as RecordWithTrackingItem)
      );
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

test('should render default case', async () => {
  const countIncreaseFunction = jest.fn();
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategories.ALL,
    increaseCategoryCount: countIncreaseFunction,
    categories: [ECategories.ALL, ECategories.TODO],
    count: {
      Archived: 0,
      Done: 0,
      Draft: 0,
      Overdue: 0,
      SignatureRequired: 0,
      Upcoming: 0,
    },
    decreaseCategoryCount: jest.fn(),
    resetCount: jest.fn(),
    setActiveCategory: jest.fn(),
  }));

  const { getByText, queryByRole } = render(
    <RecordRow memberTrackingRecordId={1} trackingItem={trackingItemWithAnnualInterval} />
  );
  await waitForElementToBeRemoved(() => queryByRole(/skeleton/i));
  await waitFor(() => getByText(/item title/i));
  expect(getByText(/item title/i)).toBeInTheDocument();
});

test('should not render if the category list does not include the active category', async () => {
  const countIncreaseFunction = jest.fn();
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategories.DONE,
    increaseCategoryCount: countIncreaseFunction,
    categories: [ECategories.TODO],
    count: {
      Archived: 0,
      Done: 0,
      Draft: 0,
      Overdue: 0,
      SignatureRequired: 0,
      Upcoming: 0,
    },
    decreaseCategoryCount: jest.fn(),
    resetCount: jest.fn(),
    setActiveCategory: jest.fn(),
  }));

  const { queryByText, queryByRole } = render(
    <RecordRow memberTrackingRecordId={1} trackingItem={trackingItemWithAnnualInterval} />
  );
  // give everything time to settle
  await waitForElementToBeRemoved(() => queryByRole(/skeleton/i));
  expect(queryByText(/item title/i)).toBeFalsy();
});

test('should not render if the status is not in the category list', async () => {
  const countIncreaseFunction = jest.fn();
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategories.DONE,
    increaseCategoryCount: countIncreaseFunction,
    categories: [ECategories.DONE],
    count: {
      Archived: 0,
      Done: 0,
      Draft: 0,
      Overdue: 0,
      SignatureRequired: 0,
      Upcoming: 0,
    },
    decreaseCategoryCount: jest.fn(),
    resetCount: jest.fn(),
    setActiveCategory: jest.fn(),
  }));

  const { queryByText, queryByRole } = render(
    <MemberItemTrackerContextProvider categories={[ECategories.ALL]}>
      <RecordRow memberTrackingRecordId={1} trackingItem={trackingItemWithAnnualInterval} />
    </MemberItemTrackerContextProvider>
  );
  // give everything time to settle
  await waitForElementToBeRemoved(() => queryByRole(/skeleton/i));
  expect(queryByText(/item title/i)).toBeFalsy();
});

test('should not render if the item status does not match active category', async () => {
  const countIncreaseFunction = jest.fn();
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategories.DONE,
    increaseCategoryCount: countIncreaseFunction,
    categories: [ECategories.ALL, ECategories.TODO, ECategories.DONE],
    count: {
      Archived: 0,
      Done: 0,
      Draft: 0,
      Overdue: 0,
      SignatureRequired: 0,
      Upcoming: 0,
    },
    decreaseCategoryCount: jest.fn(),
    resetCount: jest.fn(),
    setActiveCategory: jest.fn(),
  }));

  const { queryByText, queryByRole } = render(
    <RecordRow memberTrackingRecordId={1} trackingItem={trackingItemWithAnnualInterval} />
  );
  // give everything time to settle
  await waitForElementToBeRemoved(() => queryByRole(/skeleton/i));
  await waitFor(() => queryByText(/item title/i));
  expect(queryByText(/item title/i)).toBeFalsy();
});

test('should render the interval in number form for weird amount', async () => {
  const countIncreaseFunction = jest.fn();
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategories.ALL,
    increaseCategoryCount: countIncreaseFunction,
    categories: [ECategories.ALL, ECategories.TODO],
    count: {
      Archived: 0,
      Done: 0,
      Draft: 0,
      Overdue: 0,
      SignatureRequired: 0,
      Upcoming: 0,
    },
    decreaseCategoryCount: jest.fn(),
    resetCount: jest.fn(),
    setActiveCategory: jest.fn(),
  }));

  const { queryByText, getByText, queryByRole } = render(
    <RecordRow memberTrackingRecordId={1} trackingItem={trackingItemWithFourDayInterval} />
  );
  // give everything time to settle
  await waitForElementToBeRemoved(() => queryByRole(/skeleton/i));
  await waitFor(() => getByText(/item title/i));
  expect(queryByText(/item title/i)).toBeTruthy();
  expect(queryByText(/4 days/i)).toBeTruthy();
});
