import { renderHook } from '@testing-library/react-hooks';
import { server } from '../utils/mocks/msw';
import { Wrapper } from '../utils/TempestTestUtils';
import { usePageLogging } from '../../src/hooks/usePageLogging';
import { useTestRouter } from '../utils/mocks/NextMocks';
import { ELogEventType } from '../../src/types/global';
import { createLog } from '../../src/utils/Api';
import { mockMethodAndReturn } from '../utils/mocks/repository';
import React from 'react';

jest.mock('../../src/utils/Api.ts');

useTestRouter.mockImplementation(() => ({
  route: '/',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  prefetch: async () => {},
  push: jest.fn(),
  asPath: '/',
}));

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

test('should log when landing on a page', async () => {
  useTestRouter.mockImplementation(() => ({
    route: '/',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    prefetch: async () => {},
    push: jest.fn(),
    asPath: '/',
  }));

  mockMethodAndReturn(createLog, {});

  renderHook(() => usePageLogging(), {
    wrapper: Wrapper,
    initialProps: {
      user: { firstName: 'joe', role: { id: 323, name: 'admin' } },
    },
  });

  expect(createLog).toHaveBeenCalledWith(ELogEventType.PAGE_ACCESS, 'URI: /');
});

test('should log unathorized when user lands on /unauthorized route', async () => {
  jest.spyOn(React, 'useRef').mockReturnValue({
    current: '/Profile',
  });

  useTestRouter.mockImplementationOnce(() => ({
    route: '/Unauthenticated',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    prefetch: async () => {},
    push: jest.fn(),
    asPath: '/Unauthenticated',
  }));

  mockMethodAndReturn(createLog, {});

  renderHook(() => usePageLogging(), {
    wrapper: Wrapper,
    initialProps: {
      user: { firstName: 'joe', role: { id: 323, name: 'admin' } },
    },
  });

  expect(createLog).toHaveBeenCalledWith(ELogEventType.UNAUTHORIZED, 'Unauthorized URL: /Profile');
});
