// src/setupTests.js
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';
import { server } from '../utils/mocks/msw';
// speeds up *ByRole queries a bit
// https://github.com/testing-library/dom-testing-library/issues/552
configure({ defaultHidden: true });
require('./mockedPrisma');

// Establish API mocking before all tests.
beforeAll(() => {
  server.listen();
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();

  // resets all mocks between tests
  jest.clearAllMocks();
});
// Clean up after the tests are finished.
afterAll(() => server.close());
