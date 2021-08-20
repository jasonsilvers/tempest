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
    '<rootDir>/__tests__/utils/',
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
    '/src/prisma/seed.ts',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'text-summary'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/assets/svgrMock.tsx',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['./__tests__/setup/jest.setup.ts'],
};
