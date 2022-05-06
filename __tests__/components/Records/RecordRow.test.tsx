import { MemberTrackingRecord, TrackingItem, User } from '.prisma/client';
import React from 'react';
import 'whatwg-fetch';
import { MemberItemTrackerContextProvider } from '../../../src/components/Records/MemberRecordTracker/providers/MemberItemTrackerContext';
import * as MemberItemTrackerHooks from '../../../src/components/Records/MemberRecordTracker/providers/useMemberItemTrackerContext';
import RecordRow from '../../../src/components/Records/MemberRecordTracker/RecordRow';
import { ECategories } from '../../../src/const/enums';
import { server } from '../../testutils/mocks/msw';
import { render, waitFor } from '../../testutils/TempestTestUtils';

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

  const { getByText } = render(<RecordRow memberTrackingRecord={mtr1} trackingItem={trackingItemWithAnnualInterval} />);
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
