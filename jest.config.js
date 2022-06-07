/* eslint @typescript-eslint/no-var-requires: "off" */
const { defaults } = require('jest-config');

module.exports = {
  ...defaults,
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/cypress/',
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/setup/',
    '<rootDir>/__tests__/testutils/',
    '<rootDir?/src/prisma/seed.ts',
  ],
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'enzyme.js',
    '/.next/',
    '/__tests__/',
    '/src/repositories/common/types.ts',
    '/src/types',
    '/src/components/Dashboard/Enums.ts',
    '/src/components/Dashboard/Types.ts',
    '/src/pages/_document.tsx',
    '/src/const/',
    '/src/assets/',
    '/src/prisma/seed.ts',
    '/src/prisma/setupSeed.ts',
    '/src/prisma/global.d.ts',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'text-summary'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    /* Handle image imports
    https://jestjs.io/docs/webpack#handling-static-assets */
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__tests__/utils/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: ['./__tests__/setup/jest.setup.ts'],
};
