import { TrackingItem } from '.prisma/client';
import React from 'react';
import { MemberItemTrackerContextProvider } from '../../../src/components/Records/MemberRecordTracker/providers/MemberItemTrackerContext';
import RecordRow, { RecordWithTrackingItem } from '../../../src/components/Records/MemberRecordTracker/RecordRow';
import { ECategories, EUri } from '../../../src/const/enums';
import { render, waitFor, waitForLoadingToFinish } from '../../testutils/TempestTestUtils';
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
          createdAt: null,
          order: 0,
          trackingItemId: 1,
          traineeId: 1,
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
          createdAt: null,
          order: 0,
          trackingItemId: 1,
          traineeId: 1,
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
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategories.ALL,
    categories: [ECategories.ALL, ECategories.TODO],
    setActiveCategory: jest.fn(),
  }));

  const { getByText } = render(<RecordRow memberTrackingRecordId={1} trackingItem={trackingItemWithAnnualInterval} />);
  await waitForLoadingToFinish();
  await waitFor(() => getByText(/item title/i));
  expect(getByText(/item title/i)).toBeInTheDocument();
});

test('should not render if the category list does not include the active category', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategories.DONE,
    categories: [ECategories.TODO],
    setActiveCategory: jest.fn(),
  }));

  const { queryByText } = render(
    <RecordRow memberTrackingRecordId={1} trackingItem={trackingItemWithAnnualInterval} />
  );
  // give everything time to settle
  await waitForLoadingToFinish();
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
      <RecordRow memberTrackingRecordId={1} trackingItem={trackingItemWithAnnualInterval} />
    </MemberItemTrackerContextProvider>
  );
  // give everything time to settle
  await waitForLoadingToFinish();
  expect(queryByText(/item title/i)).toBeFalsy();
});

test('should not render if the item status does not match active category', async () => {
  jest.spyOn(MemberItemTrackerHooks, 'useMemberItemTrackerContext').mockImplementation(() => ({
    activeCategory: ECategories.DONE,
    categories: [ECategories.ALL, ECategories.TODO, ECategories.DONE],
    setActiveCategory: jest.fn(),
  }));

  const { queryByText } = render(
    <RecordRow memberTrackingRecordId={1} trackingItem={trackingItemWithAnnualInterval} />
  );
  // give everything time to settle
  await waitForLoadingToFinish();
  await waitFor(() => queryByText(/item title/i));
  expect(queryByText(/item title/i)).toBeFalsy();
});
