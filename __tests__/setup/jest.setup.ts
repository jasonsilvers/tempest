// src/setupTests.js
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';

// speeds up *ByRole queries a bit
// https://github.com/testing-library/dom-testing-library/issues/552
configure({ defaultHidden: true });

afterEach(() => {
  jest.clearAllMocks();
});
