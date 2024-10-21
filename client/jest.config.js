// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.js'],
  testMatch: ['<rootDir>/client/src/**/*.test.js'],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  testEnvironment: 'jest-environment-jsdom'
};