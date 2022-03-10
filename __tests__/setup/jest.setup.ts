// src/setupTests.js
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';

// global.console = {
//   ...console,
//   log: jest.fn(),
//   error: jest.fn(),
//   info: jest.fn(),
//   debug: jest.fn(),
// };
// speeds up *ByRole queries a bit
// https://github.com/testing-library/dom-testing-library/issues/552
configure({ defaultHidden: true });

afterEach(() => {
  jest.clearAllMocks();
});
